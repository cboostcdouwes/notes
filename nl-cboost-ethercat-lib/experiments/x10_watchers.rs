//! X10: N Watch streams for a while; prints how many snapshots arrived per stream.
use ethercat_grpc::pb::{self, machine_client::MachineClient};
use std::time::Duration;
use tokio_stream::StreamExt;

#[tokio::main]
async fn main() {
    let mut args = std::env::args().skip(1);
    let address = args.next().unwrap();
    let streams: usize = args.next().unwrap().parse().unwrap();
    let seconds: u64 = args.next().unwrap().parse().unwrap();
    let client = MachineClient::connect(address).await.unwrap();
    let mut handles = Vec::new();
    for _ in 0..streams {
        let mut client = client.clone();
        handles.push(tokio::spawn(async move {
            let mut stream = client.watch(pb::WatchRequest { names: vec![], min_interval_ms: 0 }).await.unwrap().into_inner();
            let mut count = 0u64;
            let deadline = tokio::time::sleep(Duration::from_secs(seconds));
            tokio::pin!(deadline);
            loop {
                tokio::select! {
                    _ = &mut deadline => return count,
                    item = stream.next() => { if item.is_none() { return count; } count += 1; }
                }
            }
        }));
    }
    let mut total = 0;
    for handle in handles {
        total += handle.await.unwrap();
    }
    println!("{streams} streams: {:.0} snapshots/s per stream", total as f64 / streams as f64 / seconds as f64);
}
