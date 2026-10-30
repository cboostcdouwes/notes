//! A scripted host for golden-trace tests, the counterpart of the orchestrator's scenario
//! files: the test sets the initial status, each command succeeds after one second and
//! applies its scripted status change, and every command received is recorded in order.

use std::sync::{Arc, Mutex};

use tokio::sync::watch;
use tokio::time::sleep;

use crate::dsl::secs;
use crate::machine::*;

#[derive(Clone)]
pub struct Scripted {
    world: Arc<watch::Sender<World>>,
    trace: Arc<Mutex<Vec<Command>>>,
}

impl Scripted {
    pub fn start(initial: World) -> (Self, watch::Receiver<World>) {
        let (tx, rx) = watch::channel(initial);
        (Self { world: Arc::new(tx), trace: Arc::default() }, rx)
    }

    /// Every command received so far, in order.
    pub fn trace(&self) -> Vec<Command> {
        self.trace.lock().unwrap().clone()
    }
}

impl Devices for Scripted {
    async fn send(&self, cmd: Command) -> Result<(), String> {
        self.trace.lock().unwrap().push(cmd);
        sleep(secs(1)).await;
        self.world.send_modify(|w| apply_effect(cmd, w));
        Ok(())
    }
}

/// The status change each command makes once it completes.
fn apply_effect(cmd: Command, w: &mut World) {
    let robot = w.robot.get_or_insert_with(Default::default);
    let slide = w.slide.get_or_insert_with(Default::default);
    let flip = w.flip.get_or_insert_with(Default::default);
    match cmd {
        Command::Robot(Robot::PickPlate) => {
            robot.plate_gripped = true;
            robot.plate_placed = false;
            w.detector = Some(DetectorStatus { plate_available: false });
        }
        Command::Robot(Robot::GripPlate) => {
            robot.plate_gripped = true;
            robot.plate_placed = false;
        }
        Command::Robot(Robot::ReleaseToSlideAndHome | Robot::ReleaseFinalAndHome) => {
            robot.plate_gripped = false;
            robot.plate_placed = true;
            robot.in_safe_zone = true;
        }
        Command::Robot(_) => {}
        Command::Slide(Slide::VacuumOn) => slide.vacuum_on = true,
        Command::Slide(Slide::VacuumOff) => slide.vacuum_on = false,
        // The sled starts and ends a cycle at the load position, so nothing changes.
        Command::Slide(Slide::RunCycle) => {}
        Command::Flip(Flip::Lift) => {
            flip.raised = true;
            flip.lowered = false;
        }
        Command::Flip(Flip::Lower) => {
            flip.raised = false;
            flip.lowered = true;
        }
        Command::Flip(Flip::VacuumOn) => flip.vacuum_on = true,
        Command::Flip(Flip::VacuumOff) => flip.vacuum_on = false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dsl::Ctx;
    use crate::recipe;
    use Command::{Flip as F, Robot as R, Slide as S};

    /// After the reset: all modules reported, arm home, flipper down, one plate waiting.
    fn one_plate_after_reset() -> World {
        World {
            robot: Some(RobotStatus {
                state_complete: Some(PackmlState::Resetting),
                in_safe_zone: true,
                flip_route_verified: true,
                ..Default::default()
            }),
            slide: Some(SlideStatus {
                state_complete: Some(PackmlState::Resetting),
                at_load_position: true,
                position_mm: 1206.0,
                ..Default::default()
            }),
            flip: Some(FlipStatus {
                state_complete: Some(PackmlState::Resetting),
                lowered: true,
                ..Default::default()
            }),
            detector: Some(DetectorStatus { plate_available: true }),
        }
    }

    #[tokio::test(start_paused = true)]
    async fn one_plate_sends_the_commands_in_recipe_order() {
        let (host, world) = Scripted::start(one_plate_after_reset());
        let m = Ctx::new(host.clone(), world);
        recipe::resetting(&m).await.unwrap();
        recipe::executing(&m).await.unwrap();

        let expected = [
            F(Flip::Lift),                       // RESETTING: park_flipper
            R(Robot::PickPlate),
            R(Robot::MoveToConveyor1),
            S(Slide::VacuumOn),
            R(Robot::ReleaseToSlideAndHome),     // first_side: robot track
            S(Slide::RunCycle),                  // first_side: slide track, once the plate is placed
            S(Slide::VacuumOff),                 // flip
            F(Flip::Lower),
            F(Flip::VacuumOn),
            F(Flip::Lift),
            R(Robot::MoveToFlip),
            R(Robot::GripPlate),
            F(Flip::VacuumOff),
            R(Robot::UnflipToSlide),
            S(Slide::VacuumOn),
            R(Robot::ReleaseToSlideAndHome),     // second_side: robot track
            R(Robot::MoveToConveyor2),           // robot track: sled already past 600 mm
            S(Slide::RunCycle),                  // slide track, same instant
            R(Robot::DescendToSlide),
            R(Robot::GripPlate),
            S(Slide::VacuumOff),
            R(Robot::MoveFromConveyor2),
            R(Robot::ReleaseFinalAndHome),
        ];
        assert_eq!(host.trace(), expected);
    }
}
