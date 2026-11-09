"""Read-only scan of the EtherCAT ring and the ECOMODUL's identity, PDO setup and axis state.

Writes nothing to any device: the bus goes to PRE-OP (as every master start does) and only SDO
uploads follow. No axis is enabled. Usage: sudo <venv python> -I scan_ecomodul.py enp66s0
"""

import struct
import sys

import pysoem

ECOMODUL_PRODUCT_CODES = {0x4D4F44E2, 0xE4444F4D, 0xE8444F4D}
AXIS_OBJECT_OFFSET = 0x800


def read(slave, index, subindex, fmt=None):
    try:
        raw = slave.sdo_read(index, subindex)
    except Exception as error:  # report every refusal, keep scanning
        return f"<refused: {error}>"
    if fmt is None:
        return raw.decode(errors="replace").rstrip("\x00")
    size = struct.calcsize(fmt)
    if len(raw) < size:
        return f"<{len(raw)} bytes: {raw.hex()}>"
    value = struct.unpack(fmt, raw[:size])[0]
    return f"0x{value:0{size * 2}x} ({value})"


def show(slave, label, index, subindex, fmt=None):
    print(f"  {index:#06x}:{subindex:02x} {label:<32} {read(slave, index, subindex, fmt)}")


def show_list(slave, label, index, fmt):
    show(slave, f"{label} count", index, 0, "<B")
    try:
        count = slave.sdo_read(index, 0)[0]
    except Exception:
        return
    for subindex in range(1, count + 1):
        show(slave, f"{label} [{subindex}]", index, subindex, fmt)


def main():
    master = pysoem.Master()
    master.open(sys.argv[1])
    try:
        found = master.config_init()
        print(f"{found} subdevice(s) on {sys.argv[1]}")
        for position, slave in enumerate(master.slaves):
            print(f"[{position}] name={slave.name!r} vendor=0x{slave.man:08x} "
                  f"product=0x{slave.id:08x} revision=0x{slave.rev:08x}")
        for position, slave in enumerate(master.slaves):
            if slave.id not in ECOMODUL_PRODUCT_CODES:
                continue
            print(f"\nECOMODUL at ring position {position}")
            show(slave, "device name", 0x1008, 0)
            show(slave, "hardware version", 0x1009, 0)
            show(slave, "software version", 0x100A, 0)
            show(slave, "device type", 0x1000, 0, "<I")
            show_list(slave, "axes info (node IDs)", 0x3000, "<H")
            show_list(slave, "SM2 RxPDO assign", 0x1C12, "<H")
            show_list(slave, "SM3 TxPDO assign", 0x1C13, "<H")
            show(slave, "SM2 sync mode", 0x1C32, 1, "<H")
            show(slave, "SM2 cycle time ns", 0x1C32, 2, "<I")
            show(slave, "SM3 sync mode", 0x1C33, 1, "<H")
            show(slave, "error register", 0x1001, 0, "<B")
            show_list(slave, "error history", 0x1003, "<I")
            show(slave, "nodeguarding guard time ms", 0x100C, 0, "<H")
            show(slave, "nodeguarding life time factor", 0x100D, 0, "<B")
            show_list(slave, "consumer heartbeat", 0x1016, "<I")
            try:
                axes = slave.sdo_read(0x3000, 0)[0]
            except Exception:
                axes = 2
            for axis in range(axes):
                offset = axis * AXIS_OBJECT_OFFSET
                print(f" axis {axis + 1}")
                show_list(slave, "RxPDO mapping", 0x1600 + 0x10 * axis, "<I")
                show_list(slave, "TxPDO mapping", 0x1A00 + 0x10 * axis, "<I")
                show(slave, "statusword", 0x6041 + offset, 0, "<H")
                show(slave, "mode display", 0x6061 + offset, 0, "<b")
                show(slave, "position actual", 0x6064 + offset, 0, "<i")
                show(slave, "velocity actual", 0x606C + offset, 0, "<i")
                show(slave, "error code 0x603F", 0x603F + offset, 0, "<H")
                show(slave, "digital inputs", 0x60FD + offset, 0, "<I")
                show(slave, "encoder increments", 0x608F + offset, 1, "<I")
                show(slave, "encoder revolutions", 0x608F + offset, 2, "<I")
                show(slave, "profile acceleration [16 inc/s²]", 0x6083 + offset, 0, "<I")
                show(slave, "profile deceleration [16 inc/s²]", 0x6084 + offset, 0, "<I")
                show(slave, "quick stop decel. [16 inc/s²]", 0x6085 + offset, 0, "<I")
                show(slave, "motion profile type", 0x6086 + offset, 0, "<h")
                show(slave, "quick stop option", 0x605A + offset, 0, "<h")
                show(slave, "fault reaction option", 0x605E + offset, 0, "<h")
                show(slave, "abort connection option", 0x6007 + offset, 0, "<h")
    finally:
        master.close()


if __name__ == "__main__":
    main()
