import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHTTPServer } from './server.js';
import { isWorkerMessage } from './helpers/validators.js';
import { createBalancer } from './balancer-dispatcher.js';
import { Controller } from './controller.js';
import { HTTPMethod, HTTPStatusCode } from './types/http.js';
import { ResponseError } from './types/response.js';
import { ParentMessage, Result, WorkerMessage } from './types/worker.js';
import { ErrorMessage, HTTPError } from './types/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const numCores = availableParallelism();

const handleWorkerExit = (activeWorkers: Map<number, number>, worker: Worker): void => {
  const deadWorkerPid = worker.process.pid;
  if (!deadWorkerPid) {
    console.error("Something wrong: can't determine PID of killed worker");
    return;
  }
  console.error(`worker ${deadWorkerPid} has been killed`);
  const workerPort = activeWorkers.get(deadWorkerPid);
  if (!workerPort) {
    console.error("Something wrong: can't determine port of killed worker");
    return;
  }
  const newWorker = cluster.fork({ PORT: workerPort });
  activeWorkers.delete(deadWorkerPid);
  const newWorkerPid = newWorker.process.pid;
  if (!newWorkerPid) {
    console.error("Something wrong: can't determine port of newly created worker");
    return;
  }
  activeWorkers.set(newWorkerPid, workerPort);
};

const parseWorkerMessage = (message: string): WorkerMessage | null => {
  try {
    const workerMessage: unknown = JSON.parse(message);
    if (!isWorkerMessage(workerMessage)) {
      throw new Error('Worker message have invalid format');
    }

    return workerMessage;
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error(`Failed to parse worker message: ${err.message}`);
    }

    if (err instanceof Error) {
      console.error(err.message);
    }

    return null;
  }
};

const getErrorResponse = (error: unknown): ResponseError => {
  if (error instanceof HTTPError) {
    return { statusCode: error.statusCode, message: error.message };
  } else if (error instanceof Error) {
    return { statusCode: HTTPStatusCode.ServerError, message: error.message };
  } else {
    return { statusCode: HTTPStatusCode.ServerError, message: ErrorMessage.UnknownError };
  }
};

const actOnWorkerMessage = (controller: Controller, message: WorkerMessage): ParentMessage => {
  try {
    switch (message.method) {
      case HTTPMethod.GET: {
        const result = controller.get(message.endpoint, message.userId);
        return { result: Result.Success, response: { statusCode: HTTPStatusCode.OK, data: result } };
      }

      case HTTPMethod.POST: {
        const result = controller.post(message.endpoint, message.body);
        return { result: Result.Success, response: { statusCode: HTTPStatusCode.Created, data: result } };
      }

      case HTTPMethod.PUT: {
        const result = controller.put(message.endpoint, message.userId, message.body);
        return { result: Result.Success, response: { statusCode: HTTPStatusCode.OK, data: result } };
      }

      case HTTPMethod.DELETE: {
        controller.delete(message.endpoint, message.userId);
        return { result: Result.Success, response: { statusCode: HTTPStatusCode.NoContent, data: null } };
      }
    }
  } catch (err) {
    return { result: Result.Error, response: getErrorResponse(err) };
  }
};

export const startCluster = (hostname: string, basePort: number): void => {
  const activeWorkers = new Map<number, number>();
  const workers: Worker[] = [];
  const controller = new Controller();

  cluster.setupPrimary({
    exec: path.join(__dirname, 'worker.ts'),
  });

  for (let i = 1; i < numCores; i++) {
    const worker = cluster.fork({
      HOSTNAME: hostname,
      PORT: basePort + i,
    });
    workers.push(worker);
    const newWorkerPid = worker.process.pid;
    if (!newWorkerPid) {
      console.error("Something wrong: can't determine port of newly created worker");
    } else {
      activeWorkers.set(newWorkerPid, basePort + i);
    }

    worker.on('message', (message: string) => {
      const workerMessage = parseWorkerMessage(message);
      if (!workerMessage) {
        return;
      }
      const result = actOnWorkerMessage(controller, workerMessage);
      console.error(`sending message to worker: ${newWorkerPid}`);
      worker.send(JSON.stringify(result));
    });
  }

  startHTTPServer(hostname, basePort, createBalancer(hostname, basePort + 1, numCores - 1));
  cluster.on('exit', (worker) => {
    handleWorkerExit(activeWorkers, worker);
  });
};
