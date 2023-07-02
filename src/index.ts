import 'dotenv/config';
import { startCluster } from './multi.js';
import { startHTTPServer } from './server.js';
import { dispatcher } from './dispatcher.js';
import { isMultiMode } from './helpers/cli.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';

const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

if (isMultiMode()) {
  console.log('Starting in cluster mode');
  startCluster(SERVER_HOSTNAME, PORT);
} else {
  startHTTPServer(SERVER_HOSTNAME, PORT, dispatcher);
}
