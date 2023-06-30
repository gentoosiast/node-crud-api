import http from 'node:http';
import 'dotenv/config';
import { dispatcher } from './dispatcher.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';

const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

const server = http.createServer(dispatcher);

server.on('clientError', (err, socket) => {
  if (('code' in err && err.code === 'ECONNRESET') || !socket.writable) {
    return;
  }

  socket.end('HTTP/1.1 400 Bad Request');
});

server.listen(PORT, SERVER_HOSTNAME, () => {
  console.log(`Server running at http://${SERVER_HOSTNAME}:${PORT}`);
});
