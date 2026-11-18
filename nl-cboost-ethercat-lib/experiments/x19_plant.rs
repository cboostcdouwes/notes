//! X19: an end switch that follows its valve, so a cycle runs end to end in simulation.
mod common;
use common::{CLAMP, Rig};
use ethercat_port::Value;
use ethercat_realtime::*;

#[test]
fn the_end_switch_follows_the_valve_after_its_delay() {
    let machine = Machine::parse(CLAMP).unwrap();
    let mut rig = Rig::new(CLAMP, &RuleKinds::builtin());
    rig.sim.follow(&machine, "Close", "Closed", 20).unwrap();
    assert!(rig.sim.follow(&machine, "Close", "Lamp", 1).is_err(), "Lamp is no input");
    rig.step();
    rig.send("Close", Value::Digital(true));
    let mut periods = 0;
    while rig.reading("Closed").value != Value::Digital(true) {
        rig.step();
        periods += 1;
        assert!(periods < 100);
    }
    println!("Closed read true {periods} periods after the command");
    // The held guard's condition now holds without the test setting any input by hand.
    let id = rig.send("KeepClosed", Value::Digital(true));
    rig.step();
    assert_eq!(rig.outcome(id), Some(ethercat_port::Outcome::Applied));
}
