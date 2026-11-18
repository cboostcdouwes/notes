// X2: lateness of each period start against its absolute deadline.
use std::time::{Duration, Instant};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

fn run(period: Duration, periods: usize, spin: Duration) -> Vec<f64> {
    let mut late = Vec::with_capacity(periods);
    let mut next = Instant::now() + period;
    for _ in 0..periods {
        let wake = next.checked_sub(spin).unwrap();
        let now = Instant::now();
        if wake > now { std::thread::sleep(wake - now); }
        while Instant::now() < next {}
        late.push((Instant::now() - next).as_secs_f64() * 1e6);
        next += period;
    }
    late
}

fn report(name: &str, mut late: Vec<f64>, period: Duration) {
    late.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let q = |p: f64| late[((late.len() as f64 - 1.0) * p) as usize];
    let over = late.iter().filter(|l| **l > period.as_secs_f64() * 1e6).count();
    println!("{name:34} p50 {:7.1} us  p99 {:7.1}  p99.9 {:7.1}  max {:8.1}  >1 period: {over}", q(0.5), q(0.99), q(0.999), q(1.0));
}

fn main() {
    let period = Duration::from_millis(1);
    let n = 3000;
    for loaded in [false, true] {
        let stop = Arc::new(AtomicBool::new(false));
        let load: Vec<_> = (0..if loaded { std::thread::available_parallelism().unwrap().get() } else { 0 })
            .map(|_| { let stop = stop.clone(); std::thread::spawn(move || { let mut x = 0u64; while !stop.load(Ordering::Relaxed) { x = x.wrapping_mul(31).wrapping_add(7); } std::hint::black_box(x); }) })
            .collect();
        let tag = if loaded { "all cores busy" } else { "idle" };
        report(&format!("sleep, {tag}"), run(period, n, Duration::ZERO), period);
        report(&format!("sleep + 200 us spin, {tag}"), run(period, n, Duration::from_micros(200)), period);
        stop.store(true, Ordering::Relaxed);
        for t in load { t.join().unwrap(); }
    }
}
