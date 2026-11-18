//! X9: memory per remembered command, and write throughput, under a flood of writes.
use ethercat_grpc::pb::{self, machine_client::MachineClient};
use ethercat_grpc::{ServeConfig, serve, version};
use ethercat_realtime::{Machine, RealtimeConfig, RuleKinds, SimBus, start};
use std::time::Instant;
use tokio_stream::wrappers::TcpListenerStream;

fn rss_kb() -> u64 {
    let status = std::fs::read_to_string("/proc/self/status").unwrap();
    let line = status.lines().find(|l| l.starts_with("VmRSS")).unwrap();
    line.split_whitespace().nth(1).unwrap().parse().unwrap()
}

#[tokio::main]
async fn main() {
    let text = include_str!("../../../machines/demo.toml").replace("period_us = 10000", "period_us = 1000");
    let machine = Machine::parse(&text).unwrap();
    let (bus, _sim) = SimBus::new(&machine);
    let (port, _cycle) = start(machine, bus, &RuleKinds::builtin(), RealtimeConfig::default()).unwrap();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = format!("http://{}", listener.local_addr().unwrap());
    tokio::spawn(serve(port, TcpListenerStream::new(listener), std::future::pending(), ServeConfig::default()));

    let tasks = 64u64;
    let per_task: u64 = std::env::args().nth(1).map_or(2000, |n| n.parse().unwrap());
    let mut client = MachineClient::connect(address.clone()).await.unwrap();
    let fingerprint = client.describe(pb::DescribeRequest {}).await.unwrap().into_inner().fingerprint;
    client.hello(pb::HelloRequest { client_id: "flood".into(), api_version: version::current().into(), fingerprint }).await.unwrap();

    let before = rss_kb();
    let started = Instant::now();
    let mut handles = Vec::new();
    for task in 0..tasks {
        let mut client = client.clone();
        handles.push(tokio::spawn(async move {
            let mut failed = 0;
            for n in 0..per_task {
                let id = task * per_task + n + 1;
                let request = pb::WriteRequest { client_id: "flood".into(), command_id: id, name: "Lamp".into(), value: Some(pb::write_request::Value::Digital(n % 2 == 0)) };
                failed += client.write(request).await.is_err() as u64;
            }
            failed
        }));
    }
    let mut failed = 0;
    for handle in handles {
        failed += handle.await.unwrap();
    }
    let elapsed = started.elapsed();
    let commands = tasks * per_task;
    let grown = rss_kb() - before;
    println!(
        "{commands} writes ({failed} failed) in {elapsed:.1?}: {:.0} writes/s; RSS grew {} kB = {:.0} bytes per command",
        commands as f64 / elapsed.as_secs_f64(),
        grown,
        grown as f64 * 1024.0 / commands as f64
    );
}
