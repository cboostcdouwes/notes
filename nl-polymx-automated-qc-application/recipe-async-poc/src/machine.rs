//! The command vocabulary and the signals the recipe reads, as types.
//!
//! In the YAML these are free strings (`robot_controller.plate_gripped`) checked against
//! the interface map at load time. Here a typo or a command sent to the wrong module is
//! a compile error.

use std::future::Future;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PackmlState {
    Resetting,
}

/// The latest status message of each module. `None` until its first message arrives,
/// which is what lets a `condition` on a missing signal fault instead of skipping.
#[derive(Debug, Clone, Default)]
pub struct World {
    pub robot: Option<RobotStatus>,
    pub slide: Option<SlideStatus>,
    pub flip: Option<FlipStatus>,
    pub detector: Option<DetectorStatus>,
}

#[derive(Debug, Clone, Default)]
pub struct RobotStatus {
    pub state_complete: Option<PackmlState>,
    pub in_safe_zone: bool,
    pub plate_gripped: bool,
    pub plate_placed: bool,
    pub flip_route_verified: bool,
}

#[derive(Debug, Clone, Default)]
pub struct SlideStatus {
    pub state_complete: Option<PackmlState>,
    pub vacuum_on: bool,
    pub at_load_position: bool,
    pub position_mm: f64,
}

#[derive(Debug, Clone, Default)]
pub struct FlipStatus {
    pub state_complete: Option<PackmlState>,
    pub raised: bool,
    pub lowered: bool,
    pub vacuum_on: bool,
}

/// The input stack's plate detector (DESIGN_REFERENCE.md §3.4); not part of recipe_dip.yaml.
#[derive(Debug, Clone, Default)]
pub struct DetectorStatus {
    pub plate_available: bool,
}

impl World {
    pub fn robot(&self) -> Option<&RobotStatus> {
        self.robot.as_ref()
    }
    pub fn slide(&self) -> Option<&SlideStatus> {
        self.slide.as_ref()
    }
    pub fn flip(&self) -> Option<&FlipStatus> {
        self.flip.as_ref()
    }
    pub fn detector(&self) -> Option<&DetectorStatus> {
        self.detector.as_ref()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Robot {
    PickPlate,
    MoveToConveyor1,
    ReleaseToSlideAndHome,
    MoveToFlip,
    GripPlate,
    UnflipToSlide,
    MoveToConveyor2,
    DescendToSlide,
    MoveFromConveyor2,
    ReleaseFinalAndHome,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Slide {
    VacuumOn,
    VacuumOff,
    RunCycle,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Flip {
    Lift,
    Lower,
    VacuumOn,
    VacuumOff,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Command {
    Robot(Robot),
    Slide(Slide),
    Flip(Flip),
}

impl From<Robot> for Command {
    fn from(c: Robot) -> Self {
        Command::Robot(c)
    }
}
impl From<Slide> for Command {
    fn from(c: Slide) -> Self {
        Command::Slide(c)
    }
}
impl From<Flip> for Command {
    fn from(c: Flip) -> Self {
        Command::Flip(c)
    }
}

impl Command {
    /// The status that shows the command took effect, or `None` for a motion that is done
    /// when its stream returns. `Ctx::send` waits for it after the module's result.
    pub fn end_state(self) -> Option<fn(&World) -> Option<bool>> {
        let end_state: fn(&World) -> Option<bool> = match self {
            Command::Robot(Robot::PickPlate | Robot::GripPlate) => |w| Some(w.robot()?.plate_gripped),
            Command::Robot(Robot::ReleaseToSlideAndHome | Robot::ReleaseFinalAndHome) => {
                |w| Some(w.robot()?.in_safe_zone)
            }
            Command::Robot(
                Robot::MoveToConveyor1
                | Robot::MoveToFlip
                | Robot::UnflipToSlide
                | Robot::MoveToConveyor2
                | Robot::DescendToSlide
                | Robot::MoveFromConveyor2,
            ) => return None,
            Command::Slide(Slide::VacuumOn) => |w| Some(w.slide()?.vacuum_on),
            Command::Slide(Slide::VacuumOff) => |w| Some(!w.slide()?.vacuum_on),
            Command::Slide(Slide::RunCycle) => |w| Some(w.slide()?.at_load_position),
            Command::Flip(Flip::Lift) => |w| Some(w.flip()?.raised),
            Command::Flip(Flip::Lower) => |w| Some(w.flip()?.lowered),
            Command::Flip(Flip::VacuumOn) => |w| Some(w.flip()?.vacuum_on),
            Command::Flip(Flip::VacuumOff) => |w| Some(!w.flip()?.vacuum_on),
        };
        Some(end_state)
    }
}

/// Sends a command to its module and resolves with the module's result. The ROS
/// implementation would map each variant to the action/service the interface map names.
pub trait Devices {
    fn send(&self, cmd: Command) -> impl Future<Output = Result<(), String>>;
}
