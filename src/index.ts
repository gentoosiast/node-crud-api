import 'dotenv/config';
import { startCluster } from './multi.js';
import { startHTTPServer } from './server.js';
import { dispatcher } from './dispatcher.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';

export const isMultiMode = (): boolean => {
  return process.argv.includes('--multi');
};

const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

if (isMultiMode()) {
  console.log('Starting in cluster mode');
  startCluster(SERVER_HOSTNAME, PORT);
} else {
  await startHTTPServer(SERVER_HOSTNAME, PORT, dispatcher);
}
