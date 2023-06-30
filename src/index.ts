import 'dotenv/config';
import { startHTTPServer } from './server.js';
import { dispatcher } from './dispatcher.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';

const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

startHTTPServer(SERVER_HOSTNAME, PORT, dispatcher);
