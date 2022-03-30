import socket
import soundfile as sf
import numpy as np
import time
import sys

HOST = '127.0.0.1'
PORT = 5222

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

data, fr = sf.read(sys.argv[1])
data = data.astype('float32')
seg = data.flatten().tostring()

a = fr
b = 2
fr = a.to_bytes(2, 'little')
ac = b.to_bytes(2, 'little')

s.send('abcdef'.encode())
print(s.recv(1024))
s.send(fr + ac + 'f32le'.encode())
print(s.recv(1024))
while seg:
    s.send(seg[:44100])
    time.sleep(1)
    seg = seg[44100:]
print("done")
