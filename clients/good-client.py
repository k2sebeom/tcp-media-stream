import socket
import soundfile as sf
import time
import json
import sys

data, fr = sf.read(sys.argv[1])
data = data.astype('float32')
seg = data[:, 0].flatten().tostring()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect(('127.0.0.1', 5222))
    a = 44100
    b = 1
    fr = a.to_bytes(2, 'little')
    ac = b.to_bytes(2, 'little')

    s.send('abcdef'.encode())
    print(s.recv(1024))
    s.send(fr + ac + 'f32le'.encode())
    print(s.recv(1024))
    s.send(seg)
