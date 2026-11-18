"""Sends every EtherCAT frame back with each datagram's working counter raised by one, as if one device answered
every datagram with zeros. Not a device model: just enough for the main device to think something is there."""
import socket, struct, sys
s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(0x88A4))
s.bind((sys.argv[1], 0))
while True:
    frame = bytearray(s.recv(2048))
    frame[6] |= 0x02
    at = 16  # Ethernet header 14, EtherCAT header 2
    while at + 10 <= len(frame):
        length_flags = struct.unpack_from("<H", frame, at + 6)[0]
        length = length_flags & 0x7FF
        wkc_at = at + 10 + length
        struct.pack_into("<H", frame, wkc_at, struct.unpack_from("<H", frame, wkc_at)[0] + 1)
        if not length_flags & 0x8000:
            break
        at = wkc_at + 2
    s.send(frame)
