//! X4: open and discover on a network interface, and report what comes back.
use ethercat_realtime::{Bus, EthercrabBus};
use std::time::Instant;

fn main() {
    let interface = std::env::args().nth(1).expect("interface");
    let started = Instant::now();
    let mut bus = match EthercrabBus::open(&interface) {
        Ok(bus) => bus,
        Err(error) => return println!("open failed: {error}"),
    };
    println!("opened {interface} in {:?}", started.elapsed());
    let started = Instant::now();
    match bus.discover() {
        Ok(found) => println!("discover: {} devices in {:?}: {found:?}", found.len(), started.elapsed()),
        Err(error) => println!("discover failed after {:?}: {error}", started.elapsed()),
    }
}
