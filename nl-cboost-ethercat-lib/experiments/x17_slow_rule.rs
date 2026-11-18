//! X17: a rule that sometimes takes longer than a period.
mod common;
use common::CLAMP;
use ethercat_realtime::*;
use std::time::{Duration, Instant};

struct Slow;
impl Rule for Slow {
    fn evaluate(&mut self, view: &View, _actions: &mut Actions) {
        if view.period() % 50 == 0 {
            let until = Instant::now() + Duration::from_millis(3);
            while Instant::now() < until {}
        }
    }
}
impl RuleKind for Slow {
    const KIND: &'static str = "slow";
    type Config = toml::Table;
    fn bind(_: toml::Table, _: &mut Binder) -> Result<Self, String> { Ok(Slow) }
}

#[test]
fn a_slow_rule_shows_as_overruns_and_rules_max() {
    let text = format!("{CLAMP}\n[rule.Slow]\nkind = \"slow\"\n");
    let machine = Machine::parse(&text).unwrap();
    let (bus, sim) = SimBus::new(&machine);
    let (mut port, cycle) = start(machine, bus, &RuleKinds::builtin().with::<Slow>(), RealtimeConfig::default()).unwrap();
    let started = Instant::now();
    let mut last = None;
    while started.elapsed() < Duration::from_secs(1) {
        last = Some(port.updates.wait().unwrap().state.clone());
    }
    let state = last.unwrap();
    println!("after 1 s: period {}, exchanges {}, overruns {}, rules_max {:?}, failed exchanges {}", state.period, sim.exchanges(), state.bus.overruns, state.bus.rules_max, state.bus.failed_exchanges);
    cycle.stop();
    cycle.join();
}
