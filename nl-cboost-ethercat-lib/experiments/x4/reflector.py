"""Sends every EtherCAT frame back, as a ring without devices would: payload untouched, source MAC marked."""
import socket, sys
s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(0x88A4))
s.bind((sys.argv[1], 0))
while True:
    frame = bytearray(s.recv(2048))
    frame[6] |= 0x02  # an ESC sets the locally administered bit of the source address
    s.send(frame)
