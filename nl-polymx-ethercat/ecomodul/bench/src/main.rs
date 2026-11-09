//! Bench test of the ECOMODUL driver: the ECOMODUL alone at ring position 0, driven by the
//! repo's driver.
//!
//! `status`: read-only. The driver holds both controlwords at 0, so no power stage switches on.
//!
//! `motion`: homes, moves and stops one axis through the driver's API and checks each step,
//! stopping at the first failure with the axis disabled. Homing is on the actual position
//! (method 34), so the axis does not move to home and its current position becomes 0. It then
//! only moves into negative positions, which on the lights is upwards, away from the bottom.
//! It also leaves the axis unpowered away from home for `idle_s` seconds and checks that the
//! drive keeps its position counter, so Enable brings it back without a re-home.
//!
//! `travel`: for measuring by hand, waiting for Enter before every step. Homes on the actual
//! position (method 34), moves `distance_mm` up and holds there to measure the gap left at the
//! top, then disables, enables (watch the shaft), moves back to 0 and disables. Put the
//! carriage at the bottom end first: wherever it stands becomes 0.
//!
//! Before running either, configure the drive for the encoderless motor (0x6410:29), or the
//! axis faults with 0x7305 and the test stops at its first step.
//!
//! Usage:
//!   sudo RUST_LOG=info <binary> <interface> status [seconds]
//!   sudo RUST_LOG=info <binary> <interface> motion <axis 1|2> [distance_mm] [idle_s]
//!   sudo RUST_LOG=info <binary> <interface> travel <axis 1|2> <distance_mm>

use ethercat_lib::bus_status::BusStatus;
use ethercat_lib::devices::Devices;
use ethercat_lib::drivers::ecomodul::{
    Activity, AxisConfig, AxisStatus, DriveState, Ecomodul, HomingConfig, Motion, MotionError,
    AXES,
};
use ethercat_lib::ethercat::Ethercat;
use ethercat_lib::subdevice::SubdeviceDriver;
use std::io::Write;
use std::thread::sleep;
use std::time::{Duration, Instant};

const CYCLE: Duration = Duration::from_millis(10);

/// The lights' mechanics, as in `config/light-lift.toml`: 8000 increments per revolution on a
/// spindle of 1 mm per revolution.
const INCREMENTS_PER_REVOLUTION: u32 = 8000;
const INCREMENTS_PER_MM: f64 = 8000.0;

/// Homing on the actual position, because the homing sensor is not mounted yet.
const HOMING_METHOD: i8 = 34;

/// 2 mm/s (120 rpm), because the motor on the light lift lacked the torque at the 10 mm/s first
/// tested (stepper mode, 2.65 A peak while moving). 50 mm/s² acceleration.
const SPEED: u32 = 16_000;
const ACCELERATION: u32 = 400_000;

/// How far a reported position may lie from the target: the 10 µm precision estimate.
const POSITION_TOLERANCE: i32 = 80;

fn main() {
    env_logger::init();
    let args: Vec<String> = std::env::args().skip(1).collect();
    let args: Vec<&str> = args.iter().map(String::as_str).collect();
    let outcome = match args.as_slice() {
        [interface, "status", rest @ ..] => {
            let seconds = rest.first().map_or(10, |s| s.parse().expect("seconds"));
            status(interface, seconds);
            Ok(())
        }
        [interface, "motion", axis, rest @ ..] => {
            let axis: usize = axis.parse().expect("axis 1 or 2");
            assert!((1..=AXES).contains(&axis), "axis must be 1..={AXES}");
            let distance_mm: f64 = rest.first().map_or(5.0, |s| s.parse().expect("distance_mm"));
            assert!(distance_mm > 0.0, "distance_mm must be above 0");
            let idle_s: u64 = rest.get(1).map_or(10, |s| s.parse().expect("idle_s"));
            motion(
                interface,
                axis - 1,
                (distance_mm * INCREMENTS_PER_MM).round() as i32,
                Duration::from_secs(idle_s),
            )
        }
        [interface, "travel", axis, distance_mm] => {
            let axis: usize = axis.parse().expect("axis 1 or 2");
            assert!((1..=AXES).contains(&axis), "axis must be 1..={AXES}");
            let distance_mm: f64 = distance_mm.parse().expect("distance_mm");
            assert!(distance_mm > 0.0, "distance_mm must be above 0");
            travel(interface, axis - 1, (distance_mm * INCREMENTS_PER_MM).round() as i32)
        }
        _ => {
            eprintln!(
                "usage: <interface> status [seconds] | \
                 <interface> motion <axis 1|2> [distance_mm] [idle_s] | \
                 <interface> travel <axis 1|2> <distance_mm>"
            );
            std::process::exit(2);
        }
    };
    if let Err(problem) = outcome {
        println!("FAIL {problem}");
        std::process::exit(1);
    }
    println!("PASS");
}

/// Run the bus with `driver` at ring position 0 on a thread of its own, exiting the process
/// if it stops.
fn start_bus(interface: &str, driver: Ecomodul) -> &'static Ecomodul {
    let interface: &'static str = Box::leak(interface.to_owned().into_boxed_str());
    let devices: &'static Devices = Box::leak(Box::new(Devices::new([(
        0,
        SubdeviceDriver::Ecomodul(driver),
    )])));
    // BUS_CYCLE_US overrides the bus cycle, to test the drive at other cycle times.
    let cycle = std::env::var("BUS_CYCLE_US").map_or(CYCLE, |us| {
        Duration::from_micros(us.parse().expect("BUS_CYCLE_US in microseconds"))
    });
    let bus_status: &'static BusStatus = Box::leak(Box::new(BusStatus::new(cycle)));
    std::thread::spawn(move || {
        let outcome = Ethercat::for_devices(devices, interface, cycle, bus_status).run_blocking();
        eprintln!("bus stopped: {outcome:?}");
        std::process::exit(1);
    });
    devices.get(0).and_then(|d| d.as_ecomodul()).unwrap()
}

fn status(interface: &str, seconds: u64) {
    let driver = start_bus(interface, Ecomodul::new());
    let end = Instant::now() + Duration::from_secs(seconds);
    while Instant::now() < end {
        sleep(Duration::from_millis(500));
        for axis in 0..AXES {
            match driver.status(axis) {
                Some(s) => println!(
                    "axis {}: {:?} sw={:#06x} mode={} pos={} vel={}",
                    axis + 1,
                    s.state(),
                    s.statusword,
                    s.mode,
                    s.position,
                    s.velocity
                ),
                None => println!("axis {}: no process data yet", axis + 1),
            }
        }
    }
}

/// The same configuration for both axes; only the tested axis is enabled. Travel runs from
/// `-distance` to the home position 0.
fn axis_config(distance: i32) -> AxisConfig {
    AxisConfig {
        increments_per_revolution: INCREMENTS_PER_REVOLUTION,
        homing: HomingConfig {
            method: HOMING_METHOD,
            switch_speed: SPEED,
            zero_speed: None,
            acceleration: ACCELERATION,
            end_stop: None,
        },
        min_position: -distance,
        max_position: 0,
        speed: SPEED,
        acceleration: ACCELERATION,
    }
}

fn motion(interface: &str, axis: usize, distance: i32, idle: Duration) -> Result<(), String> {
    run_on_bench(interface, axis, distance, |bench| bench.run(distance, idle))
}

fn travel(interface: &str, axis: usize, distance: i32) -> Result<(), String> {
    run_on_bench(interface, axis, distance, |bench| bench.travel(distance))
}

/// Run `test` on `axis`, with travel from `-distance` to 0, disabling the axis if it fails.
fn run_on_bench(
    interface: &str,
    axis: usize,
    distance: i32,
    test: impl FnOnce(&Bench) -> Result<(), String>,
) -> Result<(), String> {
    let driver = Ecomodul::with_axes([axis_config(distance); AXES])?;
    let bench = Bench {
        driver: start_bus(interface, driver),
        axis,
    };
    let outcome = test(&bench);
    if outcome.is_err() {
        let _ = bench.driver.disable(axis);
        // Give the cycle time to send the disable before the process exits.
        sleep(10 * CYCLE);
    }
    outcome
}

/// One axis of the driver under test.
struct Bench {
    driver: &'static Ecomodul,
    axis: usize,
}

impl Bench {
    fn run(&self, distance: i32, idle: Duration) -> Result<(), String> {
        self.process_data_without_fault()?;
        self.enable()?;
        self.home()?;
        self.move_to(-distance)?;
        self.move_to(0)?;
        self.stop_during_move(-distance)?;
        self.idle_unpowered(idle)?;
        self.move_to(0)?;
        self.disable()
    }

    /// Move up `distance` and hold there for measuring, then disable, enable and return to 0,
    /// each step only after Enter.
    fn travel(&self, distance: i32) -> Result<(), String> {
        self.process_data_without_fault()?;
        self.after_enter("enable and home: the carriage must be at the bottom end, which becomes 0")?;
        self.enable()?;
        self.home()?;
        self.after_enter(&format!("move {} up", mm(distance)))?;
        self.move_to(-distance)?;
        println!("     measure the gap left at the top, and how far the carriage moved");
        self.after_enter("disable")?;
        let before = self.position();
        self.disable()?;
        self.after_enter("enable: watch the shaft")?;
        self.enable_at(before)?;
        self.after_enter("move back to 0")?;
        self.move_to(0)?;
        self.after_enter("disable")?;
        self.disable()
    }

    /// Wait for Enter before `next`. The axis keeps whatever power state it is in meanwhile.
    fn after_enter(&self, next: &str) -> Result<(), String> {
        print!("     press Enter to {next} ");
        std::io::stdout().flush().map_err(|error| format!("stdout: {error}"))?;
        let mut line = String::new();
        std::io::stdin()
            .read_line(&mut line)
            .map_err(|error| format!("waiting for Enter: {error}"))?;
        Ok(())
    }

    fn process_data_without_fault(&self) -> Result<(), String> {
        // Covers the bus start and the driver's own fault reset.
        let end = Instant::now() + Duration::from_secs(20);
        loop {
            let status = self.driver.status(self.axis);
            if status.is_some_and(|status| !status.is_faulted()) {
                break;
            }
            if Instant::now() >= end {
                return Err(match status {
                    None => "no process data from the axis".to_owned(),
                    Some(status) => format!(
                        "axis stays faulted, statusword {:#06x}; read the fault code (0x603F) \
                         with scan_ecomodul.py",
                        status.statusword
                    ),
                });
            }
            sleep(CYCLE);
        }
        self.passed("process data, no fault");
        Ok(())
    }

    fn enable(&self) -> Result<(), String> {
        self.command("enable", self.driver.enable(self.axis))?;
        self.wait_for("Operation Enabled", Duration::from_secs(5), |status, _| {
            status.state() == Some(DriveState::OperationEnabled)
        })?;
        self.passed("enable");
        Ok(())
    }

    fn home(&self) -> Result<(), String> {
        self.command("home", self.driver.home(self.axis))?;
        let status = self.wait_for("homed", Duration::from_secs(60), |_, motion| {
            motion.homed && motion.activity == Activity::Idle
        })?;
        self.passed(&format!("home, position {}", mm(status.position)));
        Ok(())
    }

    fn move_to(&self, target: i32) -> Result<(), String> {
        let what = format!("move to {}", mm(target));
        let distance = (target - self.position()).abs();
        let started = Instant::now();
        self.command(&what, self.driver.move_to(self.axis, target))?;
        let status = self.wait_for(&what, self.move_timeout(target), |_, motion| {
            motion.activity == Activity::Idle
        })?;
        println!(
            "     {} took {:?}; at the configured speed and acceleration it takes {:?}, plus a \
             few cycles of handshake",
            mm(distance),
            started.elapsed(),
            profile_duration(distance)
        );
        self.check_position(&what, status.position, target)?;
        self.passed(&what);
        Ok(())
    }

    /// Stop a move a quarter of the way: the axis must stand still short of the target and
    /// keep its power stage on, which needs the Quick Stop option (0x605A = 5) to have taken.
    fn stop_during_move(&self, target: i32) -> Result<(), String> {
        let what = format!("stop during a move to {}", mm(target));
        let start = self.driver.status(self.axis).map_or(0, |status| status.position);
        let quarter = start + (target - start) / 4;
        self.command(&what, self.driver.move_to(self.axis, target))?;
        self.wait_for("a quarter of the move", self.move_timeout(target), |status, _| {
            (status.position - start).abs() >= (quarter - start).abs()
        })?;
        let stop_called_at = self.position();
        let stop_called = Instant::now();
        self.command(&what, self.driver.stop(self.axis))?;
        let status = self.wait_for(&what, Duration::from_secs(5), |status, motion| {
            motion.activity == Activity::Idle
                && status.velocity == 0
                && status.state() == Some(DriveState::OperationEnabled)
        })?;
        // Full speed braked at the configured deceleration: v² / 2a.
        let expected = f64::from(SPEED).powi(2) / (2.0 * f64::from(ACCELERATION));
        println!(
            "     stop called at {}, standstill {} later after {:?}; braking at the configured \
             deceleration from full speed takes {}",
            mm(stop_called_at),
            mm((status.position - stop_called_at).abs()),
            stop_called.elapsed(),
            mm(expected.round() as i32)
        );
        let motion = self.motion();
        if !motion.enabled || !motion.homed {
            return Err(format!("{what}: the axis lost its enable or its reference: {motion:?}"));
        }
        if (status.position - target).abs() <= POSITION_TOLERANCE {
            return Err(format!(
                "{what}: the axis reached the target {} instead of stopping short",
                mm(target)
            ));
        }
        self.passed(&format!("{what}, stopped at {}", mm(status.position)));
        Ok(())
    }

    /// Leave the axis unpowered where it stands for `idle`, then power it again: the drive's
    /// position counter must hold throughout, and the axis must come back homed, so it moves
    /// without a re-home. The counter is the drive's own: whether the rotor itself moved
    /// (a stepper snapping to a full step on re-energising) only shows on the shaft.
    fn idle_unpowered(&self, idle: Duration) -> Result<(), String> {
        let before = self.position();
        self.watch_the_shaft("disabling");
        self.disable()?;
        let end = Instant::now() + idle;
        let mut largest_drift = 0;
        while Instant::now() < end {
            largest_drift = largest_drift.max((self.position() - before).abs());
            sleep(CYCLE);
        }
        if largest_drift > POSITION_TOLERANCE {
            return Err(format!(
                "unpowered: the position counter drifted up to {largest_drift} increments from {}",
                mm(before)
            ));
        }
        self.passed(&format!(
            "unpowered for {idle:?} at {}, counter drifted at most {largest_drift} increments",
            mm(before)
        ));
        self.watch_the_shaft("enabling");
        self.enable_at(before)?;
        self.watch_the_shaft("moving");
        Ok(())
    }

    /// Power the axis again after it was disabled at `before`: the drive's position counter
    /// must not have jumped, and the axis must still be homed.
    fn enable_at(&self, before: i32) -> Result<(), String> {
        self.enable()?;
        let after = self.position();
        if (after - before).abs() > POSITION_TOLERANCE {
            return Err(format!(
                "re-enable: the position counter jumped from {} to {}",
                mm(before),
                mm(after)
            ));
        }
        if !self.motion().homed {
            return Err("re-enable: the axis lost its reference".to_owned());
        }
        self.passed(&format!(
            "re-enabled at {}, {} increments from before",
            mm(after),
            after - before
        ));
        Ok(())
    }

    /// Hold still for a moment before `next`, so a snap of the rotor at power-off or power-on
    /// can be told apart from the moves around it.
    fn watch_the_shaft(&self, next: &str) {
        println!("     watch the shaft: {next} in 3 s");
        sleep(Duration::from_secs(3));
        println!("     {next} now");
    }

    fn disable(&self) -> Result<(), String> {
        self.command("disable", self.driver.disable(self.axis))?;
        self.wait_for("power stage off", Duration::from_secs(2), |status, _| {
            !matches!(
                status.state(),
                Some(DriveState::OperationEnabled | DriveState::QuickStopActive)
            )
        })?;
        if !self.motion().homed {
            return Err("disable: the axis lost its reference".to_owned());
        }
        self.passed("disable, reference kept");
        Ok(())
    }

    fn command(&self, what: &str, result: Result<(), MotionError>) -> Result<(), String> {
        result.map_err(|error| match error {
            MotionError::SetupUnverified => format!(
                "{what}: SetupUnverified; the log above says whether the drive refused the \
                 position scale (0x608F) or the Quick Stop option (0x605A)"
            ),
            _ => format!("{what}: refused with {error:?}"),
        })
    }

    /// Poll the axis every cycle until `done` holds. Fails at once on a fault or a homing
    /// error, and after `timeout` with the last status read.
    fn wait_for(
        &self,
        what: &str,
        timeout: Duration,
        done: impl Fn(&AxisStatus, &Motion) -> bool,
    ) -> Result<AxisStatus, String> {
        let end = Instant::now() + timeout;
        loop {
            let status = self.driver.status(self.axis);
            let motion = self.motion();
            if let Some(status) = status {
                if status.is_faulted() {
                    return Err(format!(
                        "{what}: axis faulted, statusword {:#06x}",
                        status.statusword
                    ));
                }
                if motion.homing_failed {
                    return Err(format!(
                        "{what}: homing error, statusword {:#06x}",
                        status.statusword
                    ));
                }
                if done(&status, &motion) {
                    return Ok(status);
                }
            }
            if Instant::now() >= end {
                return Err(format!(
                    "{what}: not within {timeout:?}; last {status:?} {motion:?}"
                ));
            }
            sleep(CYCLE);
        }
    }

    fn position(&self) -> i32 {
        self.driver
            .status(self.axis)
            .expect("the axis has sent process data by now")
            .position
    }

    fn motion(&self) -> Motion {
        self.driver
            .motion(self.axis)
            .expect("a driver built with_axes has motion")
    }

    /// Travel time at full speed from the current position to `target`, plus the time to
    /// speed up and slow down, plus 2 s to spare.
    fn move_timeout(&self, target: i32) -> Duration {
        let start = self.driver.status(self.axis).map_or(0, |status| status.position);
        let distance = f64::from((target - start).unsigned_abs());
        let seconds = distance / f64::from(SPEED) + 2.0 * f64::from(SPEED) / f64::from(ACCELERATION);
        Duration::from_secs_f64(seconds + 2.0)
    }

    fn check_position(&self, what: &str, position: i32, target: i32) -> Result<(), String> {
        if (position - target).abs() > POSITION_TOLERANCE {
            return Err(format!(
                "{what}: ended at {}, {} increments from the target",
                mm(position),
                position - target
            ));
        }
        Ok(())
    }

    fn passed(&self, step: &str) {
        println!("ok   axis {}: {step}", self.axis + 1);
    }
}

/// How long a trapezoid profile over `distance` increments takes at `SPEED` and
/// `ACCELERATION`: a triangle if the axis never reaches full speed.
fn profile_duration(distance: i32) -> Duration {
    let distance = f64::from(distance);
    let speed = f64::from(SPEED);
    let acceleration = f64::from(ACCELERATION);
    let seconds = if distance >= speed * speed / acceleration {
        distance / speed + speed / acceleration
    } else {
        2.0 * (distance / acceleration).sqrt()
    };
    Duration::from_secs_f64(seconds)
}

/// An increment count as millimetres, for the report.
fn mm(increments: i32) -> String {
    format!("{:.3} mm", f64::from(increments) / INCREMENTS_PER_MM)
}
