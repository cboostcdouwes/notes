//! A simulated cell: each command takes plausible time and updates the status signals.
//! Run under tokio's paused clock, a 15-minute cycle finishes in milliseconds.

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;

use tokio::sync::watch;
use tokio::time::sleep;

use crate::dsl::secs;
use crate::machine::*;

#[derive(Clone, Default)]
pub struct SimConfig {
    /// Where the robot's reset leaves the arm (it may decline to walk home).
    pub arm_home_after_reset: bool,
    /// The robot never publishes a status message.
    pub robot_silent: bool,
    /// This command's handler reports failure.
    pub fail: Option<Command>,
    /// How many slide `VacuumOn` commands succeed without the vacuum sealing.
    pub slide_seal_failures: u32,
    /// Plates on the input stack.
    pub plates: u32,
}

#[derive(Clone)]
pub struct Sim {
    world: Arc<watch::Sender<World>>,
    config: SimConfig,
    slide_seal_failures_left: Arc<AtomicU32>,
    plates_left: Arc<AtomicU32>,
}

impl Sim {
    /// Starts the modules' reset hooks; their status messages arrive 2 s later.
    pub fn start(config: SimConfig) -> (Self, watch::Receiver<World>) {
        let (tx, rx) = watch::channel(World::default());
        let slide_seal_failures_left = Arc::new(AtomicU32::new(config.slide_seal_failures));
        let plates_left = Arc::new(AtomicU32::new(config.plates));
        let sim = Self { world: Arc::new(tx), config, slide_seal_failures_left, plates_left };
        let reset = sim.clone();
        tokio::spawn(async move {
            sleep(secs(2)).await;
            reset.world.send_modify(|w| {
                if !reset.config.robot_silent {
                    w.robot = Some(RobotStatus {
                        state_complete: Some(PackmlState::Resetting),
                        in_safe_zone: reset.config.arm_home_after_reset,
                        flip_route_verified: true,
                        ..Default::default()
                    });
                }
                w.slide = Some(SlideStatus {
                    state_complete: Some(PackmlState::Resetting),
                    at_load_position: true,
                    position_mm: 1206.0,
                    ..Default::default()
                });
                w.flip = Some(FlipStatus {
                    state_complete: Some(PackmlState::Resetting),
                    lowered: true,
                    ..Default::default()
                });
                w.detector = Some(DetectorStatus { plate_available: reset.config.plates > 0 });
            });
        });
        (sim, rx)
    }

    pub fn plates_left(&self) -> u32 {
        self.plates_left.load(Ordering::Relaxed)
    }

    /// Takes the top plate off the input stack and updates the detector.
    fn take_plate(&self) {
        let left = self.plates_left.load(Ordering::Relaxed).saturating_sub(1);
        self.plates_left.store(left, Ordering::Relaxed);
        self.world.send_modify(|w| w.detector = Some(DetectorStatus { plate_available: left > 0 }));
    }

    fn robot(&self, f: impl FnOnce(&mut RobotStatus)) {
        self.world.send_modify(|w| f(w.robot.get_or_insert_with(Default::default)));
    }
    fn slide(&self, f: impl FnOnce(&mut SlideStatus)) {
        self.world.send_modify(|w| f(w.slide.get_or_insert_with(Default::default)));
    }
    fn flip(&self, f: impl FnOnce(&mut FlipStatus)) {
        self.world.send_modify(|w| f(w.flip.get_or_insert_with(Default::default)));
    }

    async fn release_and_home(&self, release_after: u64, home_after: u64) {
        sleep(secs(release_after)).await;
        self.robot(|r| {
            r.plate_gripped = false;
            r.plate_placed = true;
        });
        sleep(secs(home_after)).await;
        self.robot(|r| r.in_safe_zone = true);
    }

    /// Out from the load end (1206 mm) to 0 mm and back at ~120 mm/s, 5 s dwell.
    async fn slide_cycle(&self) {
        self.slide(|s| s.at_load_position = false);
        let path = (0..=20).rev().chain(0..=20).map(|i| i as f64 * 1206.0 / 20.0);
        for (i, position) in path.enumerate() {
            if i == 21 {
                sleep(secs(5)).await;
            }
            self.slide(|s| s.position_mm = position);
            sleep(tokio::time::Duration::from_millis(500)).await;
        }
        self.slide(|s| s.at_load_position = true);
    }
}

impl Devices for Sim {
    async fn send(&self, cmd: Command) -> Result<(), String> {
        if self.config.fail == Some(cmd) {
            sleep(secs(1)).await;
            return Err(format!("simulated failure of {cmd:?}"));
        }
        match cmd {
            Command::Robot(Robot::PickPlate) => {
                self.robot(|r| {
                    r.in_safe_zone = false;
                    r.plate_placed = false;
                });
                sleep(secs(30)).await;
                self.robot(|r| r.plate_gripped = true);
                self.take_plate();
            }
            Command::Robot(Robot::ReleaseToSlideAndHome) => self.release_and_home(10, 30).await,
            Command::Robot(Robot::ReleaseFinalAndHome) => self.release_and_home(5, 25).await,
            Command::Robot(Robot::GripPlate) => {
                sleep(secs(2)).await;
                self.robot(|r| {
                    r.plate_gripped = true;
                    r.plate_placed = false;
                });
            }
            Command::Robot(Robot::MoveToFlip | Robot::MoveToConveyor2) => {
                self.robot(|r| r.in_safe_zone = false);
                sleep(secs(30)).await;
            }
            Command::Robot(_) => sleep(secs(40)).await,
            Command::Slide(Slide::VacuumOn) => {
                let fails = self
                    .slide_seal_failures_left
                    .try_update(Ordering::Relaxed, Ordering::Relaxed, |left| left.checked_sub(1))
                    .is_ok();
                if !fails {
                    self.slide(|s| s.vacuum_on = true);
                }
            }
            Command::Slide(Slide::VacuumOff) => self.slide(|s| s.vacuum_on = false),
            Command::Slide(Slide::RunCycle) => self.slide_cycle().await,
            Command::Flip(Flip::Lift) => {
                self.flip(|f| f.lowered = false);
                sleep(secs(2)).await;
                self.flip(|f| f.raised = true);
            }
            Command::Flip(Flip::Lower) => {
                self.flip(|f| f.raised = false);
                sleep(secs(2)).await;
                self.flip(|f| f.lowered = true);
            }
            Command::Flip(Flip::VacuumOn) => self.flip(|f| f.vacuum_on = true),
            Command::Flip(Flip::VacuumOff) => self.flip(|f| f.vacuum_on = false),
        }
        Ok(())
    }
}
