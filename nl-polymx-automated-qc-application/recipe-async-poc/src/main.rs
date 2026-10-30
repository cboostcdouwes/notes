mod dsl;
mod machine;
mod recipe;
mod sim;
#[cfg(test)]
mod scripted;

use dsl::{Ctx, Fault};
use sim::{Sim, SimConfig};

/// Runs a reset and then plate cycles until the stack is empty.
/// Returns the outcome and the plates left on the stack.
async fn run_batch(config: SimConfig) -> (Result<(), Fault>, u32) {
    let (sim, world) = Sim::start(config);
    let m = Ctx::new(sim.clone(), world);
    let outcome = async {
        recipe::resetting(&m).await?;
        recipe::executing(&m).await
    }
    .await;
    (outcome, sim.plates_left())
}

#[tokio::main(flavor = "current_thread", start_paused = true)]
async fn main() {
    let (outcome, _) = run_batch(SimConfig { arm_home_after_reset: true, plates: 3, ..Default::default() }).await;
    println!("\n{outcome:?}");
}

#[cfg(test)]
mod tests {
    use super::*;
    use dsl::FaultKind;
    use machine::{Command, Robot, Slide};

    #[tokio::test(start_paused = true)]
    async fn healthy_cycle_completes() {
        let (outcome, _) = run_batch(SimConfig { arm_home_after_reset: true, plates: 1, ..Default::default() }).await;
        assert_eq!(outcome, Ok(()));
    }

    #[tokio::test(start_paused = true)]
    async fn batch_runs_a_cycle_per_plate_until_the_stack_is_empty() {
        let (outcome, plates_left) = run_batch(SimConfig { arm_home_after_reset: true, plates: 3, ..Default::default() }).await;
        assert_eq!(outcome, Ok(()));
        assert_eq!(plates_left, 0);
    }

    #[tokio::test(start_paused = true)]
    async fn empty_stack_ends_the_batch_before_any_pick() {
        // A started cycle would fault at its first step, the failing pick.
        let fail = Some(Command::Robot(Robot::PickPlate));
        let (outcome, _) = run_batch(SimConfig { arm_home_after_reset: true, fail, ..Default::default() }).await;
        assert_eq!(outcome, Ok(()));
    }

    #[tokio::test(start_paused = true)]
    async fn arm_not_home_skips_park_and_faults_at_await_arm_home() {
        let (outcome, _) = run_batch(SimConfig { plates: 1, ..Default::default() }).await;
        assert_eq!(outcome, Err(Fault { step: "await_arm_home".into(), kind: FaultKind::StepTimeout }));
    }

    #[tokio::test(start_paused = true)]
    async fn silent_robot_faults_the_park_condition_instead_of_skipping() {
        let (sim, world) = Sim::start(SimConfig { robot_silent: true, ..Default::default() });
        let m = Ctx::new(sim, world);
        // Barrier would time out on the missing robot; check the condition on its own.
        tokio::time::sleep(dsl::secs(3)).await;
        let outcome = m.step_if("park_flipper", |w| Some(w.robot()?.in_safe_zone), dsl::secs(30), async { Ok(()) }).await;
        assert_eq!(outcome, Err(Fault { step: "park_flipper".into(), kind: FaultKind::MissingSignal }));
    }

    #[tokio::test(start_paused = true)]
    async fn failure_in_one_parallel_track_faults_the_cycle_at_that_scoped_step() {
        let fail = Some(Command::Slide(Slide::RunCycle));
        let (outcome, _) = run_batch(SimConfig { arm_home_after_reset: true, plates: 1, fail, ..Default::default() }).await;
        let fault = outcome.unwrap_err();
        assert_eq!(fault.step, "first_side/run_slide_cycle");
        assert!(matches!(fault.kind, FaultKind::CommandFailed { .. }));
    }

    #[tokio::test(start_paused = true)]
    async fn slide_grip_retries_until_the_vacuum_seals() {
        let config = SimConfig { arm_home_after_reset: true, plates: 1, slide_seal_failures: 2, ..Default::default() };
        assert_eq!(run_batch(config).await.0, Ok(()));
    }

    #[tokio::test(start_paused = true)]
    async fn slide_grip_faults_when_the_last_attempt_does_not_seal() {
        let config = SimConfig { arm_home_after_reset: true, plates: 1, slide_seal_failures: 3, ..Default::default() };
        let (outcome, _) = run_batch(config).await;
        assert_eq!(outcome, Err(Fault { step: "slide_grip".into(), kind: FaultKind::StepTimeout }));
    }
}
