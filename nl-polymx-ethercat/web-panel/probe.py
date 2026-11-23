#!/usr/bin/env python3
"""What a browser-served debug panel does to a claimed output when the browser goes away.

Starts the real server on the simulated machine (no EtherCAT interface is opened), serves the
unmodified debug panel through serve_panel.py, and plays the browser over the websocket: it
clicks one supervised output ON, ends the "tab" in a given way, and records what the server
then reports - who owns the output, whether it is still on, and whether MachineHealthy is
still high.

    PYTHONPATH=<site with textual-serve> <client venv>/bin/python probe.py [--repo <repo>]

The server binary must be built: cargo build --manifest-path server/Cargo.toml
"""

import argparse
import asyncio
import contextlib
import json
import os
import signal
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, List, Set, Tuple

import aiohttp
import grpc

HERE = Path(__file__).resolve().parent
DEFAULT_REPO = Path.home() / "Cboost" / "PolyMX-QC" / "nl-polymx-ethercat"

SERVER_ADDRESS = "127.0.0.1:50190"
WEB_PORT = 8190
TERMINAL_SIZE = (160, 50)

# Supervised with `fallback = false` in machine-simulated.toml and in no interlock: a lease
# expiry switches it off, a clean close leaves it alone.
OUTPUT = "SledRelease"
OUTPUT_RESOURCE = (1, 16)
HEALTH = "MachineHealthy"
# Supervised, de-energised on fallback by default, and not interlocked with OUTPUT.
SECOND_OUTPUT = "RobotRelease"
SECOND_OUTPUT_RESOURCE = (1, 14)

# Seconds a freshly started panel gets to finish its first startup-notice read, which
# resizes the banner above the buttons and so moves them.
PANEL_SETTLE_S = 3.0
POLL_S = 0.02
# A scenario is over once the panel process is gone and nothing changed for this long.
QUIET_S = 3.0
TIMEOUT_S = 45.0


@dataclass(frozen=True)
class Observed:
    panel_running: bool
    session_open: bool
    owns_output: bool
    output_on: bool
    healthy: bool

    def __str__(self) -> str:
        return (
            f"panel {'running' if self.panel_running else 'gone   '}  "
            f"session {'open' if self.session_open else 'gone'}  "
            f"{OUTPUT} owned by {'panel ' if self.owns_output else 'nobody'}  "
            f"{OUTPUT} {'ON ' if self.output_on else 'OFF'}  "
            f"{HEALTH} {'high' if self.healthy else 'low'}"
        )


class Observer:
    """Reads server state over raw stubs, so that observing registers no session."""

    def __init__(self, repo: Path):
        sys.path.insert(0, str(repo / "client"))
        from ethercat_client import bus_pb2, bus_pb2_grpc, signal_pb2, signal_pb2_grpc

        self._bus_pb2, self._signal_pb2 = bus_pb2, signal_pb2
        self._channel = grpc.insecure_channel(SERVER_ADDRESS)
        self._bus = bus_pb2_grpc.BusStub(self._channel)
        self._signal = signal_pb2_grpc.SignalStub(self._channel)

    def close(self) -> None:
        self._channel.close()

    def lease_ms(self) -> int:
        return self._bus.GetSessions(self._bus_pb2.Empty(), timeout=1.0).lease_ms

    def sessions(self) -> Dict[int, Set[Tuple[int, int]]]:
        """What each registered session generation owns."""
        reply = self._bus.GetSessions(self._bus_pb2.Empty(), timeout=1.0)
        return {
            session.generation: {(owned.device, owned.channel) for owned in session.owns}
            for session in reply.sessions
        }

    def is_on(self, name: str) -> bool:
        return self._signal.Get(self._signal_pb2.Selector(name=name), timeout=1.0).state

    def observe(self, tab: "Tab") -> Observed:
        sessions = self.sessions()
        return Observed(
            panel_running=process_running(tab.pid),
            session_open=tab.generation in sessions,
            owns_output=OUTPUT_RESOURCE in sessions.get(tab.generation, set()),
            output_on=self.is_on(OUTPUT),
            healthy=self.is_on(HEALTH),
        )


def process_running(pid: int) -> bool:
    """False once the process has exited, including while it waits to be reaped."""
    try:
        stat = Path(f"/proc/{pid}/stat").read_text()
    except OSError:
        return False
    state = stat.rsplit(")", 1)[1].split()[0]
    return state != "Z"


def panel_pids(panel: Path) -> Set[int]:
    """The debug_panel.py interpreters textual-serve has started against the probe's server."""
    pids = set()
    for entry in Path("/proc").iterdir():
        if not entry.name.isdigit():
            continue
        try:
            argv = (entry / "cmdline").read_bytes().split(b"\0")
        except OSError:
            continue
        is_python = Path(os.fsdecode(argv[0])).name.startswith("python")
        if is_python and argv[1:3] == [os.fsencode(panel), SERVER_ADDRESS.encode()]:
            pids.add(int(entry.name))
    return pids


async def wait_for(condition: Callable[[], object], what: str, timeout: float = 20.0):
    """Poll `condition` off the event loop until it returns something truthy."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            result = await asyncio.to_thread(condition)
        except grpc.RpcError:
            result = None
        if result:
            return result
        await asyncio.sleep(0.05)
    raise TimeoutError(f"timed out waiting for {what}")


class Tab:
    """One browser tab: a websocket to textual-serve and the panel process behind it."""

    def __init__(self, socket: aiohttp.ClientWebSocketResponse, pid: int, generation: int):
        self.socket = socket
        self.pid = pid
        self.generation = generation
        # Reading is what answers the server's websocket pings.
        self._reader = asyncio.create_task(self._read_forever())

    @classmethod
    async def open(cls, rig: "Rig") -> "Tab":
        observer, panel = rig.observer, rig.panel
        pids_before = panel_pids(panel)
        generations_before = set(observer.sessions())
        width, height = TERMINAL_SIZE
        socket = await rig.http.ws_connect(
            f"http://127.0.0.1:{WEB_PORT}/ws?width={width}&height={height}"
        )
        new_pids = await wait_for(lambda: panel_pids(panel) - pids_before, "the panel process")
        new_generations = await wait_for(
            lambda: set(observer.sessions()) - generations_before, "the panel's session"
        )
        (pid,), (generation,) = new_pids, new_generations
        return cls(socket, pid, generation)

    async def _read_forever(self) -> None:
        async for _ in self.socket:
            pass

    async def click(self, x: int, y: int) -> None:
        """A left click at a 0-based cell, as xterm.js reports it in SGR mouse mode."""
        for press_or_release in "Mm":
            sequence = f"\x1b[<0;{x + 1};{y + 1}{press_or_release}"
            await self.socket.send_str(json.dumps(["stdin", sequence]))

    async def close(self) -> None:
        """What closing the tab does: a websocket close frame."""
        await self.socket.close()

    async def go_silent(self) -> None:
        """What a dead link looks like to the server: the connection stays, nothing answers."""
        self._reader.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await self._reader


async def button_position(repo: Path, button_id: str) -> Tuple[int, int]:
    """Where the panel draws a button at TERMINAL_SIZE, read from a headless run of it."""
    sys.path.insert(0, str(repo / "client"))
    from debug_panel import DebugPanel

    panel = DebugPanel(SERVER_ADDRESS)
    async with panel.run_test(size=TERMINAL_SIZE) as pilot:
        await pilot.pause(PANEL_SETTLE_S)
        region = panel.query_one(f"#{button_id}").region
    return region.x + region.width // 2, region.y


async def claim_from_new_tab(
    rig: "Rig",
    on_button: Tuple[int, int],
    output: str = OUTPUT,
    resource: Tuple[int, int] = OUTPUT_RESOURCE,
) -> Tab:
    tab = await Tab.open(rig)
    await asyncio.sleep(PANEL_SETTLE_S)
    await tab.click(*on_button)
    observer = rig.observer
    await wait_for(
        lambda: resource in observer.sessions().get(tab.generation, set())
        and observer.is_on(output),
        f"the click to claim {output}",
        timeout=5.0,
    )
    return tab


async def watch(observer: Observer, tab: Tab, started: float) -> List[Tuple[float, Observed]]:
    """Every change the server reports from `started` until the scenario is over."""
    timeline: List[Tuple[float, Observed]] = []
    last_change = started
    while True:
        seen = await asyncio.to_thread(observer.observe, tab)
        now = time.monotonic()
        if not timeline or seen != timeline[-1][1]:
            timeline.append((now - started, seen))
            last_change = now
        settled = not seen.panel_running and now - last_change > QUIET_S
        if settled or now - started > TIMEOUT_S:
            return timeline
        await asyncio.sleep(POLL_S)


def print_timeline(before: Observed, timeline: List[Tuple[float, Observed]]) -> None:
    print(f"  before     {before}")
    for elapsed, seen in timeline:
        print(f"  +{elapsed:6.2f} s  {seen}")
    if timeline[-1][1].panel_running:
        print(f"  the panel was still running when the probe gave up after {TIMEOUT_S:.0f} s")


@contextlib.contextmanager
def background(command: List[str], show_logs: bool, **kwargs):
    """Run a process group for the length of the block, and take all of it down after."""
    output = None if show_logs else subprocess.DEVNULL
    process = subprocess.Popen(
        command, stdout=output, stderr=output, start_new_session=True, **kwargs
    )
    try:
        yield process
    finally:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            pass
        with contextlib.suppress(ProcessLookupError):
            os.killpg(process.pid, signal.SIGKILL)
        process.wait()


@dataclass
class Rig:
    http: aiohttp.ClientSession
    observer: Observer
    panel: Path
    launcher: subprocess.Popen


@contextlib.asynccontextmanager
async def rig(repo: Path, show_logs: bool):
    """A fresh simulated server, the web launcher in front of it, and an observer."""
    binary = repo / "server" / "target" / "debug" / "grpc-server"
    machine = repo / "config" / "machine-simulated.toml"
    panel = repo / "client" / "debug_panel.py"
    if not binary.exists():
        raise SystemExit(f"server binary not built at {binary}")

    server_command = [str(binary), "--machine", str(machine), "--address", SERVER_ADDRESS]
    launcher_command = [
        sys.executable, str(HERE / "serve_panel.py"), str(panel), SERVER_ADDRESS,
        "--port", str(WEB_PORT),
    ]
    server_env = dict(os.environ, RUST_LOG="warn")
    with background(server_command, show_logs, cwd=repo, env=server_env):
        observer = Observer(repo)
        try:
            await wait_for(lambda: observer.lease_ms(), "the server to answer")
            with background(launcher_command, show_logs) as launcher:
                async with aiohttp.ClientSession() as http:
                    await wait_for_page(http)
                    yield Rig(http, observer, panel, launcher)
        finally:
            observer.close()


async def wait_for_page(http: aiohttp.ClientSession) -> None:
    deadline = time.monotonic() + 20.0
    while time.monotonic() < deadline:
        try:
            async with http.get(f"http://127.0.0.1:{WEB_PORT}/") as response:
                if response.status == 200:
                    return
        except aiohttp.ClientError:
            pass
        await asyncio.sleep(0.1)
    raise TimeoutError("timed out waiting for the web launcher")


async def end_of_tab_scenario(repo: Path, show_logs: bool, title: str, end_tab) -> None:
    """Claim the output from one tab, end the tab with `end_tab`, and print what follows."""
    async with rig(repo, show_logs) as started_rig:
        observer = started_rig.observer
        print(f"\n== {title} (lease {observer.lease_ms()} ms) ==")
        on_button = await button_position(repo, f"set-{OUTPUT}-1")
        tab = await claim_from_new_tab(started_rig, on_button)
        before = observer.observe(tab)
        started = time.monotonic()
        await end_tab(started_rig, tab)
        timeline = await watch(observer, tab, started)
        print_timeline(before, timeline)
        await tab.close()


async def second_tab_scenario(repo: Path, show_logs: bool) -> None:
    print("\n== a second tab presses the same button ==")
    async with rig(repo, show_logs) as started_rig:
        observer = started_rig.observer
        on_button = await button_position(repo, f"set-{OUTPUT}-1")
        first = await claim_from_new_tab(started_rig, on_button)
        print(f"  first tab claimed     first:  {observer.observe(first)}")
        second = await claim_from_new_tab(started_rig, on_button)
        await asyncio.sleep(1.0)
        print(f"  second tab pressed    first:  {observer.observe(first)}")
        print(f"                        second: {observer.observe(second)}")
        print(f"  panel processes: {len(panel_pids(started_rig.panel))}, "
              f"sessions: {len(observer.sessions())}")
        await first.close()
        await second.close()


def print_two_tabs(observer: Observer, when: str, tabs: Dict[str, Tab]) -> None:
    names = {OUTPUT_RESOURCE: OUTPUT, SECOND_OUTPUT_RESOURCE: SECOND_OUTPUT}
    sessions = observer.sessions()
    print(f"  {when}")
    for label, tab in tabs.items():
        if tab.generation in sessions:
            owned = ", ".join(names.get(r, str(r)) for r in sorted(sessions[tab.generation]))
            print(f"    {label:6} tab: session open, owns [{owned}]")
        else:
            print(f"    {label:6} tab: session gone")
    states = "  ".join(
        f"{name} {'ON' if observer.is_on(name) else 'OFF'}"
        for name in (OUTPUT, SECOND_OUTPUT)
    )
    print(f"    {states}  {HEALTH} {'high' if observer.is_on(HEALTH) else 'low'}")


async def two_operators_scenario(repo: Path, show_logs: bool) -> None:
    print("\n== two tabs drive different outputs, then the first tab's panel dies ==")
    async with rig(repo, show_logs) as started_rig:
        observer = started_rig.observer
        first_on = await button_position(repo, f"set-{OUTPUT}-1")
        second_on = await button_position(repo, f"set-{SECOND_OUTPUT}-1")
        second_off = await button_position(repo, f"set-{SECOND_OUTPUT}-0")
        first = await claim_from_new_tab(started_rig, first_on)
        second = await claim_from_new_tab(
            started_rig, second_on, SECOND_OUTPUT, SECOND_OUTPUT_RESOURCE
        )
        tabs = {"first": first, "second": second}
        await asyncio.sleep(1.0)
        print_two_tabs(observer, "both tabs claimed their own output:", tabs)

        os.kill(first.pid, signal.SIGKILL)
        await asyncio.sleep(1.0)
        print_two_tabs(observer, "first tab's panel killed (its lease expires):", tabs)

        await second.click(*second_off)
        await asyncio.sleep(1.0)
        print_two_tabs(observer, f"second tab presses {SECOND_OUTPUT} OFF:", tabs)

        await second.click(*second_on)
        await asyncio.sleep(1.0)
        print_two_tabs(observer, f"second tab presses {SECOND_OUTPUT} ON:", tabs)
        await second.close()


async def kill_panel(rig: Rig, tab: Tab) -> None:
    os.kill(tab.pid, signal.SIGKILL)


async def close_tab(rig: Rig, tab: Tab) -> None:
    await tab.close()


async def silence_link(rig: Rig, tab: Tab) -> None:
    await tab.go_silent()


async def kill_launcher(rig: Rig, tab: Tab) -> None:
    rig.launcher.kill()


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=DEFAULT_REPO)
    parser.add_argument("--show-logs", action="store_true",
                        help="let the server and the web launcher write to this terminal")
    parser.add_argument("--scenario", choices=["end-of-tab", "same-button", "two-operators"],
                        help="run only this scenario group")
    args = parser.parse_args()

    if args.scenario in (None, "end-of-tab"):
        # The first is what the server sees today when a directly-run panel's host drops
        # off the network: renewal simply stops.
        scenarios = [
            ("panel process killed (renewal stops)", kill_panel),
            ("tab closed", close_tab),
            ("browser link goes silent", silence_link),
            ("web launcher killed", kill_launcher),
        ]
        for title, end_tab in scenarios:
            await end_of_tab_scenario(args.repo, args.show_logs, title, end_tab)
    if args.scenario in (None, "same-button"):
        await second_tab_scenario(args.repo, args.show_logs)
    if args.scenario in (None, "two-operators"):
        await two_operators_scenario(args.repo, args.show_logs)


if __name__ == "__main__":
    asyncio.run(main())
