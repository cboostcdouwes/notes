//! recipe_dip.yaml, step for step. Step names and budgets are the YAML's; the comments
//! that explain *why* each step exists would move over unchanged and are left out here.
//! A command's own end state (the YAML's `wait_for` after an action) is awaited by
//! `send`; see `Command::end_state`. Only waits that are not a command's end state remain.

use crate::dsl::{secs, Ctx, Fault};
use crate::machine::{Devices, Flip, PackmlState::Resetting, Robot, Slide};

const SLIDE_GRIP_ATTEMPTS: u32 = 3;

pub async fn resetting(m: &Ctx<impl Devices>) -> Result<(), Fault> {
    m.step("await_modules", secs(405), m.wait_for(|w| {
        Some(
            w.robot()?.state_complete == Some(Resetting)
                && w.slide()?.state_complete == Some(Resetting)
                && w.flip()?.state_complete == Some(Resetting),
        )
    }))
    .await?;

    m.step_if("park_flipper", |w| Some(w.robot()?.in_safe_zone), secs(30), m.send(Flip::Lift)).await
}

/// Illustrative, not in the YAML: one plate cycle per plate, until the input stack is empty.
/// The arm is checked home once before the batch: every cycle ends with it home.
pub async fn executing(m: &Ctx<impl Devices>) -> Result<(), Fault> {
    m.step("await_arm_home", secs(5), m.wait_for(|w| Some(w.robot()?.in_safe_zone))).await?;
    while m.step("check_plate_available", secs(5), m.read(|w| Some(w.detector()?.plate_available))).await? {
        plate_cycle(m).await?;
    }
    Ok(())
}

async fn plate_cycle(m: &Ctx<impl Devices>) -> Result<(), Fault> {
    m.step("pick_plate", secs(445), m.send(Robot::PickPlate)).await?;
    m.step("to_slide", secs(450), m.send(Robot::MoveToConveyor1)).await?;

    // Illustrative, not in the YAML: when the slide vacuum does not seal, vent it and try
    // again. Shows a loop with a counter, which the YAML can only express by unrolling.
    for attempt in 1..=SLIDE_GRIP_ATTEMPTS {
        match m.step("slide_grip", secs(25), m.send(Slide::VacuumOn)).await {
            Ok(()) => break,
            Err(_) if attempt < SLIDE_GRIP_ATTEMPTS => {
                m.step("slide_vent_before_retry", secs(25), m.send(Slide::VacuumOff)).await?;
            }
            Err(fault) => return Err(fault),
        }
    }

    // ---- first-side scan, overlapped with the robot's return home ----
    m.scope("first_side", async |m| {
        let robot_home = m.step("return_home", secs(450), m.send(Robot::ReleaseToSlideAndHome));
        tokio::try_join!(robot_home, slide_scan_track(m))
    })
    .await?;

    // ---- turn the plate over for its second side ----
    m.step("await_robot_home_before_flip", secs(95), m.wait_for(|w| {
        let robot = w.robot()?;
        Some(robot.in_safe_zone && robot.flip_route_verified && w.slide()?.at_load_position)
    }))
    .await?;

    m.step("slide_release_to_flip", secs(25), m.send(Slide::VacuumOff)).await?;
    m.step("flip_lower", secs(30), m.send(Flip::Lower)).await?;
    m.step("flip_grip", secs(35), m.send(Flip::VacuumOn)).await?;
    m.step("flip_lift", secs(30), m.send(Flip::Lift)).await?;
    m.step("robot_to_flip", secs(220), m.send(Robot::MoveToFlip)).await?;
    m.step("robot_takes_from_flip", secs(25), m.send(Robot::GripPlate)).await?;
    m.step("flip_release", secs(40), m.send(Flip::VacuumOff)).await?;
    m.step("robot_unflip", secs(450), m.send(Robot::UnflipToSlide)).await?;
    m.step("slide_grip_flipped", secs(25), m.send(Slide::VacuumOn)).await?;

    // ---- second-side scan, overlapped with the robot's approach ----
    m.scope("second_side", async |m| {
        let robot_approach = async {
            m.step("return_home", secs(450), m.send(Robot::ReleaseToSlideAndHome)).await?;
            m.step("await_slide_returning", secs(120), m.wait_for(|w| Some(w.slide()?.position_mm >= 600.0)))
                .await?;
            m.step("approach_during_return", secs(165), m.send(Robot::MoveToConveyor2)).await
        };
        tokio::try_join!(robot_approach, slide_scan_track(m))
    })
    .await?;

    m.step("collect_from_slide", secs(255), m.send(Robot::DescendToSlide)).await?;
    m.step("robot_regrip", secs(25), m.send(Robot::GripPlate)).await?;
    m.step("slide_release", secs(25), m.send(Slide::VacuumOff)).await?;
    m.step("final_place", secs(465), m.send(Robot::MoveFromConveyor2)).await?;
    m.step("final_release_and_home", secs(330), m.send(Robot::ReleaseFinalAndHome)).await
}

/// Scans the plate on the sled; runs once per side.
async fn slide_scan_track(m: &Ctx<impl Devices>) -> Result<(), Fault> {
    m.step("wait_for_slide_release", secs(450), m.wait_for(|w| Some(w.robot()?.plate_placed))).await?;
    m.step("wait_for_flipper_clear", secs(20), m.wait_for(|w| Some(w.flip()?.raised))).await?;
    m.step("run_slide_cycle", secs(300), m.send(Slide::RunCycle)).await
}
