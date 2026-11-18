//! Experiment X1: invariants of the cycle over random runs.

mod common;

use common::{CLAMP, EL2008, Rig};
use ethercat_port::{Outcome, Value};
use ethercat_realtime::*;
use serde::Deserialize;
use std::sync::atomic::{AtomicU64, Ordering::Relaxed};

static HELD_PERIODS: AtomicU64 = AtomicU64::new(0);
static APPLIES: AtomicU64 = AtomicU64::new(0);
static LAMP_FORCED: AtomicU64 = AtomicU64::new(0);
static VALVE_ON: AtomicU64 = AtomicU64::new(0);
static REJECTED: AtomicU64 = AtomicU64::new(0);

/// xorshift64*: deterministic per seed, no dependency.
struct Rng(u64);

impl Rng {
    fn next(&mut self) -> u64 {
        self.0 ^= self.0 >> 12;
        self.0 ^= self.0 << 25;
        self.0 ^= self.0 >> 27;
        self.0.wrapping_mul(0x2545_f491_4f6c_dd1d)
    }
    fn below(&mut self, n: u64) -> u64 {
        self.next() % n
    }
    fn chance(&mut self, percent: u64) -> bool {
        self.below(100) < percent
    }
}

struct OffWhile {
    output: Output,
    input: Input,
}

#[derive(Deserialize)]
struct OffWhileConfig {
    output: String,
    input: String,
}

impl RuleKind for OffWhile {
    const KIND: &'static str = "off_while";
    type Config = OffWhileConfig;
    fn bind(config: OffWhileConfig, binder: &mut Binder) -> Result<Self, String> {
        Ok(OffWhile { output: binder.output(&config.output)?, input: binder.input(&config.input)? })
    }
}

impl Rule for OffWhile {
    fn evaluate(&mut self, view: &View, actions: &mut Actions) {
        if view.input(self.input) == Some(true) {
            actions.force(self.output, false);
        }
    }
}

const TARGETS: [&str; 5] = ["Close", "Open", "Lamp", "Light", "KeepClosed"];

fn digital(rig: &Rig, name: &str) -> bool {
    rig.reading(name).value == Value::Digital(true)
}

fn run(seed: u64, periods: usize) {
    let text = format!("{CLAMP}\n[rule.LampOff]\nkind = \"off_while\"\noutput = \"Lamp\"\ninput = \"Opened\"\n");
    let config = RealtimeConfig { max_commands_per_period: 3, ..RealtimeConfig::default() };
    let mut rig = Rig::with_config(&text, &RuleKinds::builtin().with::<OffWhile>(), &config);
    let mut rng = Rng(seed | 1);
    let mut sent = Vec::new();
    rig.sim.record();
    rig.step();

    for _ in 0..periods {
        for _ in 0..rng.below(5) {
            let name = TARGETS[rng.below(TARGETS.len() as u64) as usize];
            let value = if name == "Light" { Value::Analog(rng.below(40000) as i16) } else { Value::Digital(rng.chance(50)) };
            let target = rig.port.description.target(name).unwrap();
            if rig.port.commands.submit(ethercat_port::Command { id: sent.len() as u64 + 1000, target, value }).is_ok() {
                sent.push((name, value));
            }
        }
        if rng.chance(20) {
            rig.sim.set_input(1, rng.below(2) as u8, rng.chance(50));
        }
        rig.sim.set_failing(rng.chance(5));

        let held_before = digital(&rig, "KeepClosed");
        let valves_before = (digital(&rig, "Close"), digital(&rig, "Open"));
        let closed_input = rig.reading("Closed");
        rig.step();
        let state = rig.state.clone().unwrap();
        let period = state.period;

        // I1: the interlock holds in every commanded state.
        assert!(!(digital(&rig, "Close") && digital(&rig, "Open")), "seed {seed} period {period}: both valves on");
        // I2: while a guard stays applied, the valves it protects don't change.
        if digital(&rig, "Close") || digital(&rig, "Open") { VALVE_ON.fetch_add(1, Relaxed); }
        if rig.reading("Lamp").forced_by.is_some() { LAMP_FORCED.fetch_add(1, Relaxed); }
        if held_before && digital(&rig, "KeepClosed") {
            HELD_PERIODS.fetch_add(1, Relaxed);
            assert_eq!(valves_before, (digital(&rig, "Close"), digital(&rig, "Open")), "seed {seed} period {period}: valves changed under the guard");
        }
        // I3: freshness never runs ahead, and is this period exactly when the exchange worked.
        for reading in state.readings.iter() {
            assert!(reading.fresh_at.is_none_or(|fresh| fresh <= period));
        }
        assert_eq!(rig.reading("Closed").fresh_at == Some(period), state.bus.exchanging, "seed {seed} period {period}");
        // I4: the lamp is off in any period whose exchange read Opened as true.
        if rig.reading("Opened").fresh_at == Some(period) && digital(&rig, "Opened") {
            assert!(!digital(&rig, "Lamp"), "seed {seed} period {period}: lamp on while forced off");
        }
        // I5: a guard only becomes applied when its condition held.
        if !held_before && digital(&rig, "KeepClosed") {
            APPLIES.fetch_add(1, Relaxed);
            assert!(digital(&rig, "Close"), "seed {seed} period {period}: guard applied with Close off");
            let _ = closed_input;
            assert_eq!(rig.reading("Closed").value, Value::Digital(true), "seed {seed} period {period}: guard applied with Closed false");
        }
    }

    // I6: with the ring healthy again, every accepted command gets exactly one outcome.
    rig.sim.set_failing(false);
    rig.steps(sent.len() / 3 + 5);
    assert_eq!(rig.outcomes.len(), sent.len(), "seed {seed}: outcomes missing");
    // I8: no rule refuses a write to a target outside its own: ClampValves only guards Close and Open,
    // KeepClosed only Close and Open, LampOff only Lamp.
    let outside = |rule: &str, name: &str| match rule {
        "ClampValves" | "KeepClosed" => !matches!(name, "Close" | "Open" | "KeepClosed"),
        "LampOff" => name != "Lamp",
        _ => false,
    };
    for (index, (name, _)) in sent.iter().enumerate() {
        if let Some((Outcome::Rejected(ethercat_port::Reason::Rule { rule, .. }), _)) = rig.outcomes.get(&(index as u64 + 1000)) {
            let rule = &rig.port.description.rules[usize::from(*rule)].name;
            assert!(!outside(rule, name), "seed {seed}: {rule} refused a write to {name}");
        }
    }
    // I7: every exchanged image has the interlock pair apart.
    for image in rig.sim.recorded() {
        assert_ne!(image[usize::from(EL2008)][0] & 0b11, 0b11, "seed {seed}: both valves in an exchanged image");
    }
    REJECTED.fetch_add(rig.outcomes.values().filter(|(o, _)| *o != Outcome::Applied).count() as u64, Relaxed);
    let applied = rig.outcomes.values().filter(|(o, _)| *o == Outcome::Applied).count();
    assert!(applied > 0, "seed {seed}: nothing was ever applied");
}

#[test]
fn invariants_hold_over_random_runs() {
    let seeds: u64 = std::env::var("SEEDS").ok().and_then(|s| s.parse().ok()).unwrap_or(300);
    for seed in 1..=seeds {
        run(seed.wrapping_mul(0x9e37_79b9_7f4a_7c15), 400);
    }
    println!("held periods {} applies {} lamp forced {} valve on {} rejected {}", HELD_PERIODS.load(Relaxed), APPLIES.load(Relaxed), LAMP_FORCED.load(Relaxed), VALVE_ON.load(Relaxed), REJECTED.load(Relaxed));
}
