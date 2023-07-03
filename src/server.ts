import cluster from 'node:cluster';
import http from 'node:http';
import { isMultiMode } from './helpers/cli.js';
import { getProcessType } from './helpers/processes.js';

export const startHTTPServer = async (
  hostname: string,
  port: number,
  dispatcher: http.RequestListener
): Promise<http.Server> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(dispatcher);

    server.listen(port, hostname, () => {
      console.log(`${getProcessType()} with PID ${process.pid} running at http://${hostname}:${port}`);
    });

    server.on('clientError', (err, socket) => {
      if (('code' in err && err.code === 'ECONNRESET') || !socket.writable) {
        return;
      }

      socket.end('HTTP/1.1 400 Bad Request');
    });

    server.on('listening', () => {
      if (isMultiMode() && cluster.isWorker) {
        process.send?.(process.pid);
      }
      resolve(server);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
};
