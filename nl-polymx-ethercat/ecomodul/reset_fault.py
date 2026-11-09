"""Clear the fault on one ECOMODUL axis, over SDO, and show the statusword before and after.

Sends a CiA 402 fault reset: controlword 0x00 then 0x80 then 0x00, a rising edge on bit 7.
A cleared axis goes to 'switch on disabled'; the power stage stays off. A fault whose cause is
still present (e.g. an encoder fault) comes straight back.
Usage: sudo <venv python> -I reset_fault.py enp66s0 --axis 2
"""

import argparse
import struct
import time

import pysoem

ECOMODUL_PRODUCT_CODES = {0x4D4F44E2, 0xE4444F4D, 0xE8444F4D}
AXIS_OBJECT_OFFSET = 0x800
CONTROLWORD = 0x6040
STATUSWORD = 0x6041
ERROR_CODE = 0x603F
FAULT_RESET = 0x80


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("interface")
    parser.add_argument("--axis", type=int, choices=range(1, 9), required=True)
    args = parser.parse_args()
    offset = (args.axis - 1) * AXIS_OBJECT_OFFSET

    master = pysoem.Master()
    master.open(args.interface)
    try:
        if master.config_init() <= 0:
            raise SystemExit(f"no EtherCAT subdevices found on {args.interface}")
        slave = next((s for s in master.slaves if s.id in ECOMODUL_PRODUCT_CODES), None)
        if slave is None:
            raise SystemExit("no ECOMODUL on the bus")

        def report(when):
            status = struct.unpack("<H", slave.sdo_read(STATUSWORD + offset, 0))[0]
            error = struct.unpack("<H", slave.sdo_read(ERROR_CODE + offset, 0))[0]
            print(f"axis {args.axis} {when}: statusword 0x{status:04x}, error code 0x{error:04x}")

        report("before")
        for controlword in (0x00, FAULT_RESET, 0x00):
            slave.sdo_write(CONTROLWORD + offset, 0, struct.pack("<H", controlword))
            time.sleep(0.1)
        report("after")
    finally:
        master.close()


if __name__ == "__main__":
    main()
