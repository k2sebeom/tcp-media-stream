import * as net from 'net';
import { isValidKey } from './util/auth';
import { spawn, ChildProcess } from 'child_process';
import { allowedFormats } from './util/audio';


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
            try {
                const frameRate: number = data.slice(0, 2).readUInt16LE();
                const channelCount: number = data.slice(2, 4).readUInt16LE();
                const inputFormat: string = data.slice(4, 9).toString();

                if (!allowedFormats.includes(inputFormat)) {
                    throw 'Input format is not valid';
                }

                process = spawn('ffmpeg', ['-f', `${inputFormat}`, '-ar', `${frameRate}`, '-ac', `${channelCount}`, '-i', 'pipe:', '-f', 'wav', ,'-y', `${playbackId}.wav`]);
                socket.write('good');
                isStreamReady = true;
            } catch (err: unknown) {
                // If data is malformed, kill socket
                socket.write('wrong');
                socket.end();
                socket.destroy();
            }    
        }
        else {
            const streamKey: string = data.toString();
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
