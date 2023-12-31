import 'dotenv/config';
import cluster from 'node:cluster';
import { startCluster } from './multi.js';
import { startHTTPServer } from './server.js';
import { createDispatcher } from './dispatcher.js';
import { createDispatcher as createWorkerDispatcher } from './worker-dispatcher.js';
import { isMultiMode } from './helpers/cli.js';
import { DEFAULT_SERVER_PORT, DEFAULT_SERVER_HOSTNAME } from './constants/index.js';

const HOSTNAME = process.env.HOSTNAME ?? DEFAULT_SERVER_HOSTNAME;
const PORT = parseInt(process.env.PORT ?? '', 10) || DEFAULT_SERVER_PORT;
const isCluster = isMultiMode();

if (isCluster && cluster.isPrimary) {
  console.log('Starting in cluster mode with round-robin load balancer');
  await startCluster(HOSTNAME, PORT);
  console.log('Cluster is fully operational and ready to receive requests');
} else if (isCluster && cluster.isWorker) {
  await startHTTPServer(HOSTNAME, PORT, await createWorkerDispatcher());
} else {
  await startHTTPServer(HOSTNAME, PORT, await createDispatcher());
  console.log('Server is fully operational and ready to receive requests');
}
