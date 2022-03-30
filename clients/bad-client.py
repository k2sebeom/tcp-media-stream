import socket
import soundfile as sf
import time
import json
import sys

data, fr = sf.read(sys.argv[1])
data = data.astype('float32')
seg = data.flatten().tostring()

# Sends wrong data a lot
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect(('127.0.0.1', 5222))
    s.send(seg)
    s.send(seg)
    print(s.recv())
