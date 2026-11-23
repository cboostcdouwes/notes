#!/usr/bin/env python3
"""Serve the unmodified debug panel in a browser, through textual-serve.

    python serve_panel.py <path to client/debug_panel.py> <grpc host:port>

Every browser tab that opens the page starts its own debug_panel.py process on this host,
so every tab is its own server session.

Needs `pip install textual-serve` next to the panel's own dependencies.
"""

import argparse
import shlex
import sys

from textual_serve.server import Server


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("panel", help="path to client/debug_panel.py")
    parser.add_argument("address", help="gRPC server the panel connects to, host:port")
    parser.add_argument("--host", default="127.0.0.1", help="interface to listen on")
    parser.add_argument("--port", type=int, default=8000)
    # The page tells the browser where its websocket is, and builds that from the public
    # URL. Listening on 0.0.0.0 without one hands browsers a ws://0.0.0.0 address.
    parser.add_argument("--public-url", help="URL browsers reach this host by, "
                                             "e.g. http://rig-pc:8000")
    args = parser.parse_args()

    panel_command = shlex.join([sys.executable, args.panel, args.address])
    Server(
        panel_command,
        host=args.host,
        port=args.port,
        title="PolyMX debug panel",
        public_url=args.public_url,
    ).serve()


if __name__ == "__main__":
    main()
