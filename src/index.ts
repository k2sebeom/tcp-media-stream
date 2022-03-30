import * as net from 'net';
import { isValidKey } from './util/auth';
import { spawn, ChildProcess } from 'child_process';

const server: net.Server = net.createServer((socket: net.Socket) => {
    console.log(socket.address());

    let isAuthorized: boolean = false;
    let isStreamReady: boolean = false;

    let playbackId: string = "";
    let process: ChildProcess | null = null;

    socket.on('data', (data: Buffer) => {
        if (isStreamReady) {
            // Gets stream data
            process.stdin.write(data);
        }
        else if (isAuthorized) {
            // Check stream metadata
            const frameRate: number = data.slice(0, 2).readUInt16LE();
            const channelCount: number = data.slice(2, 4).readUInt16LE();
            const inputFormat: string = data.slice(4, 9).toString();

            console.log(frameRate, channelCount, inputFormat);
            process = spawn('ffmpeg', ['-f', `${inputFormat}`, '-ar', `${frameRate}`, '-ac', `${channelCount}`, '-i', 'pipe:', '-f', 'wav', ,'-y', `${playbackId}.wav`]);
            socket.write('good');
            isStreamReady = true;
        }
        else {
            const streamKey: string = data.toString();
            console.log(streamKey);
            playbackId = isValidKey(streamKey);

            if (!playbackId) {
                // If failed to authenticate
                socket.write('wrong');
                socket.end();
                socket.destroy();
            }
            else {
                // If authentication succeeded
                socket.write('good');
                isAuthorized = true;
            }
        }
    });

    socket.on('close', () => {
        console.log("Disconnected");
    });
});


server.on('error', (err: Error) => {
    console.log(err);
});


server.listen(5222, () => {
    console.log("Listening...");
});
