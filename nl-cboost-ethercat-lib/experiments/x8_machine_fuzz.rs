//! Experiment X8: random edits of a machine file never panic in parse or build.

use ethercat_realtime::*;
use std::panic::{AssertUnwindSafe, catch_unwind};

const DEMO: &str = include_str!("../../../machines/demo.toml");

struct Rng(u64);
impl Rng {
    fn next(&mut self) -> u64 {
        self.0 ^= self.0 >> 12;
        self.0 ^= self.0 << 25;
        self.0 ^= self.0 >> 27;
        self.0.wrapping_mul(0x2545_f491_4f6c_dd1d)
    }
    fn below(&mut self, n: usize) -> usize {
        (self.next() % n as u64) as usize
    }
}

const VALUES: [&str; 14] = [
    "0", "1", "7", "8", "255", "65535", "-1", "\"EL2008\"", "\"EK1100\"", "true", "\"Close\"", "[]",
    "[\"Close\", \"Close\"]", "{ Close = true, ClampOpen = false, Light = true }",
];

fn mutate(rng: &mut Rng) -> String {
    let mut lines: Vec<String> = DEMO.lines().map(str::to_owned).collect();
    for _ in 0..1 + rng.below(4) {
        let at = rng.below(lines.len());
        match rng.below(4) {
            0 => {
                lines.remove(at);
            }
            1 => {
                let copy = lines[at].clone();
                lines.insert(rng.below(lines.len()), copy);
            }
            _ => {
                if let Some((key, _)) = lines[at].split_once(" = ") {
                    lines[at] = format!("{key} = {}", VALUES[rng.below(VALUES.len())]);
                }
            }
        }
    }
    lines.join("\n")
}

#[test]
fn no_machine_file_edit_panics() {
    let mut rng = Rng(0x1234_5678_9abc_def1);
    let (mut parsed, mut built, mut panics) = (0, 0, Vec::new());
    for case in 0..20_000 {
        let text = mutate(&mut rng);
        let outcome = catch_unwind(AssertUnwindSafe(|| {
            let Ok(machine) = Machine::parse(&text) else { return (false, false) };
            let (bus, _sim) = SimBus::new(&machine);
            (true, build(machine, bus, &RuleKinds::builtin(), &RealtimeConfig::default()).is_ok())
        }));
        match outcome {
            Ok((p, b)) => {
                parsed += p as usize;
                built += b as usize;
            }
            Err(_) => panics.push((case, text)),
        }
    }
    println!("parsed {parsed}, built {built}, panics {}", panics.len());
    if let Some((case, text)) = panics.first() {
        panic!("case {case} panicked:\n{text}");
    }
}
