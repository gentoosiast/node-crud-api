import { startHTTPServer } from './server.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';
import { dispatcher } from './worker-dispatcher.js';

const HOSTNAME = process.env.HOSTNAME ?? SERVER_HOSTNAME;
const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

startHTTPServer(HOSTNAME, PORT, dispatcher);
