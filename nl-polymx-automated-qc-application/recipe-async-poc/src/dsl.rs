//! The four primitives the YAML engine provides, as plain async functions:
//! a step with a time budget, sending a command, waiting for signals, and a condition.
//! `parallel: … sync: wait_all` needs no primitive: it is `tokio::try_join!`.

use std::future::Future;
use std::rc::Rc;
use std::time::Duration;

use tokio::sync::watch;
use tokio::time::{timeout, Instant};

use crate::machine::{Command, Devices, World};

#[derive(Debug, Clone, PartialEq)]
pub struct Fault {
    /// The step's name with its scopes, e.g. `second_side/run_slide_cycle`.
    pub step: String,
    pub kind: FaultKind,
}

#[derive(Debug, Clone, PartialEq)]
pub enum FaultKind {
    StepTimeout,
    CommandFailed { cmd: Command, reason: String },
    MissingSignal,
    StatusStreamClosed,
}

pub struct Ctx<D> {
    devices: Rc<D>,
    world: watch::Receiver<World>,
    started: Instant,
    scopes: Vec<&'static str>,
}

pub fn secs(s: u64) -> Duration {
    Duration::from_secs(s)
}

impl<D: Devices> Ctx<D> {
    pub fn new(devices: D, world: watch::Receiver<World>) -> Self {
        Self { devices: Rc::new(devices), world, started: Instant::now(), scopes: Vec::new() }
    }

    /// Runs `body` with a context whose steps are named inside `name`, so a step that runs
    /// in more than one place still faults and logs under a distinct name. The body's own
    /// `m` shadows the outer one, so a step in the block cannot escape the scope.
    pub async fn scope<T>(&self, name: &'static str, body: impl AsyncFnOnce(&Self) -> T) -> T {
        let mut scopes = self.scopes.clone();
        scopes.push(name);
        let scoped = Self { devices: Rc::clone(&self.devices), world: self.world.clone(), started: self.started, scopes };
        body(&scoped).await
    }

    fn qualified(&self, step: &'static str) -> String {
        let mut path = self.scopes.clone();
        path.push(step);
        path.join("/")
    }

    /// Runs `body` as the step `name`; the budget covers the whole body, as `timeout_ms`
    /// does. Dropping the body on timeout cancels the waits, not the module's own work.
    pub async fn step<T>(
        &self,
        name: &'static str,
        budget: Duration,
        body: impl Future<Output = Result<T, FaultKind>>,
    ) -> Result<T, Fault> {
        let step = self.qualified(name);
        self.log(&step, "start");
        let outcome = match timeout(budget, body).await {
            Ok(Ok(value)) => Ok(value),
            Ok(Err(kind)) => Err(kind),
            Err(_) => Err(FaultKind::StepTimeout),
        };
        self.log(&step, if outcome.is_ok() { "done" } else { "FAULT" });
        outcome.map_err(|kind| Fault { step, kind })
    }

    /// Like `step`, but skipped when `condition` is false. A condition on a module whose
    /// status has not arrived yet faults instead of skipping.
    pub async fn step_if(
        &self,
        name: &'static str,
        condition: impl Fn(&World) -> Option<bool>,
        budget: Duration,
        body: impl Future<Output = Result<(), FaultKind>>,
    ) -> Result<(), Fault> {
        // Bound first: a borrow in the match head would hold the status lock across the step.
        let holds = condition(&self.world.borrow());
        match holds {
            None => Err(Fault { step: self.qualified(name), kind: FaultKind::MissingSignal }),
            Some(false) => {
                self.log(&self.qualified(name), "skipped");
                Ok(())
            }
            Some(true) => self.step(name, budget, body).await,
        }
    }

    /// Sends `cmd`, waits for the module's result, then for the command's end state.
    pub async fn send(&self, cmd: impl Into<Command>) -> Result<(), FaultKind> {
        let cmd = cmd.into();
        self.devices
            .send(cmd)
            .await
            .map_err(|reason| FaultKind::CommandFailed { cmd, reason })?;
        match cmd.end_state() {
            Some(end_state) => self.wait_for(end_state).await,
            None => Ok(()),
        }
    }

    /// The current value of a signal; a module that has not reported yet is a fault.
    /// Async only so it can be a step's body, which names the fault.
    pub async fn read<T>(&self, signal: impl Fn(&World) -> Option<T>) -> Result<T, FaultKind> {
        let value = signal(&self.world.borrow());
        value.ok_or(FaultKind::MissingSignal)
    }

    /// Waits until `predicate` holds; a module that has not reported yet counts as "not yet".
    pub async fn wait_for(&self, predicate: impl Fn(&World) -> Option<bool>) -> Result<(), FaultKind> {
        let mut world = self.world.clone();
        world
            .wait_for(|w| predicate(w) == Some(true))
            .await
            .map(|_| ())
            .map_err(|_| FaultKind::StatusStreamClosed)
    }

    fn log(&self, step: &str, event: &str) {
        let t = self.started.elapsed().as_secs_f64();
        println!("{t:8.1}s  {step:<32} {event}");
    }
}
