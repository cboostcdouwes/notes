//! X12: a schedule of commands, field inputs and exchange failures per period replays to identical output images
//! and outcomes, so recording those three is enough to reproduce a run.
mod common;

use common::{CLAMP, Rig};
use ethercat_port::{Command, Value};
use ethercat_realtime::RuleKinds;

#[derive(Clone)]
struct Period {
    commands: Vec<(&'static str, Value)>,
    inputs: u8,
    failing: bool,
}

fn schedule(seed: u64, periods: usize) -> Vec<Period> {
    let mut x = seed | 1;
    let mut next = move || {
        x ^= x >> 12;
        x ^= x << 25;
        x ^= x >> 27;
        x.wrapping_mul(0x2545_f491_4f6c_dd1d)
    };
    let names = ["Close", "Open", "Lamp", "Light", "KeepClosed"];
    (0..periods)
        .map(|_| Period {
            commands: (0..next() % 5)
                .map(|_| {
                    let name = names[(next() % 5) as usize];
                    let value = if name == "Light" { Value::Analog((next() % 40000) as i16) } else { Value::Digital(next() % 2 == 0) };
                    (name, value)
                })
                .collect(),
            inputs: (next() % 4) as u8,
            failing: next() % 20 == 0,
        })
        .collect()
}

fn play(schedule: &[Period]) -> (Vec<Vec<Vec<u8>>>, Vec<(u64, String)>) {
    let mut rig = Rig::new(CLAMP, &RuleKinds::builtin());
    rig.sim.record();
    let mut id = 0;
    for period in schedule {
        for (name, value) in &period.commands {
            id += 1;
            let target = rig.port.description.target(name).unwrap();
            let _ = rig.port.commands.submit(Command { id, target, value: *value });
        }
        rig.sim.set_input(1, 0, period.inputs & 1 != 0);
        rig.sim.set_input(1, 1, period.inputs & 2 != 0);
        rig.sim.set_failing(period.failing);
        rig.step();
    }
    let mut outcomes: Vec<_> = rig.outcomes.iter().map(|(id, outcome)| (*id, format!("{outcome:?}"))).collect();
    outcomes.sort();
    (rig.sim.recorded(), outcomes)
}

#[test]
fn a_recorded_schedule_replays_identically() {
    for seed in 1..=200u64 {
        let schedule = schedule(seed.wrapping_mul(0x9e37_79b9_7f4a_7c15), 300);
        let first = play(&schedule);
        assert!(!first.0.is_empty() && !first.1.is_empty());
        assert_eq!(first, play(&schedule), "seed {seed}");
    }
}
