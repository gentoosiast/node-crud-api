import 'dotenv/config';
import { startCluster } from './multi.js';
import { startHTTPServer } from './server.js';
import { dispatcher } from './dispatcher.js';
import { isMultiMode } from './helpers/cli.js';
import { DEFAULT_SERVER_PORT, SERVER_HOSTNAME } from './constants/index.js';

const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;

if (isMultiMode()) {
  console.log('Starting in cluster mode with round-robin load balancer');
  await startCluster(SERVER_HOSTNAME, PORT);
  console.log('Cluster is fully operational and ready to receive requests');
} else {
  await startHTTPServer(SERVER_HOSTNAME, PORT, dispatcher);
  console.log('Server is fully operational and ready to receive requests');
}
