import http from 'node:http';
import { getProcessType } from './helpers/processes.js';

export const startHTTPServer = (hostname: string, port: number, dispatcher: http.RequestListener): http.Server => {
  const server = http.createServer(dispatcher);

  server.on('clientError', (err, socket) => {
    if (('code' in err && err.code === 'ECONNRESET') || !socket.writable) {
      return;
    }

    socket.end('HTTP/1.1 400 Bad Request');
  });

  server.listen(port, hostname, () => {
    console.log(`${getProcessType()} with PID ${process.pid} running at http://${hostname}:${port}`);
  });

  return server;
};
