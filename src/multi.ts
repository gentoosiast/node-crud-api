import cluster, { Worker } from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { startHTTPServer } from './server.js';
import { getModuleDirectory } from './helpers/fs-utils.js';
import { isWorkerMessage } from './helpers/validators.js';
import { createBalancer } from './balancer-dispatcher.js';
import { Controller } from './controller.js';
import { ErrorMessage, HTTPError, InvalidHTTPMethodError, ServerError } from './types/errors.js';
import { HTTPMethod, HTTPStatusCode } from './types/http.js';
import { ResponseError } from './types/response.js';
import { ParentMessage, Result, WorkerMessage } from './types/worker.js';

const handleWorkerExit = (activeWorkers: Map<number, number>, hostname: string, worker: Worker): void => {
  const deadWorkerPid = worker.process.pid;
  if (!deadWorkerPid) {
    console.error("Something wrong: can't determine PID of killed worker");
    return;
  }
  console.error(`worker ${deadWorkerPid} has been killed`);
  const workerPort = activeWorkers.get(deadWorkerPid);
  activeWorkers.delete(deadWorkerPid);
  if (!workerPort) {
    console.error("Something wrong: can't determine port of killed worker");
    return;
  }
  const newWorker = cluster.fork({ HOSTNAME: hostname, PORT: workerPort });
  const newWorkerPid = newWorker.process.pid;
  if (!newWorkerPid) {
    console.error("Something wrong: can't determine port of newly created worker");
    return;
  }
  activeWorkers.set(newWorkerPid, workerPort);
};

const parseWorkerMessage = (message: string): WorkerMessage => {
  const workerMessage: unknown = JSON.parse(message);
  if (!isWorkerMessage(workerMessage)) {
    throw new ServerError('Worker message have invalid format');
  }

  return workerMessage;
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

const actOnWorkerMessage = (controller: Controller, unparsedMessage: unknown): ParentMessage => {
  try {
    if (typeof unparsedMessage !== 'string') {
      throw new ServerError('Worker message have invalid format');
    }
    const message = parseWorkerMessage(unparsedMessage);
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

      default: {
        throw new InvalidHTTPMethodError();
      }
    }
  } catch (err) {
    return { result: Result.Error, response: getErrorResponse(err) };
  }
};

const createWorkers = (
  hostname: string,
  basePort: number,
  numCores: number,
  activeWorkers: Map<number, number>
): Promise<void>[] => {
  const controller = new Controller();
  const workerPromises: Promise<void>[] = [];

  for (let i = 1; i < numCores; i++) {
    const worker = cluster.fork({
      HOSTNAME: hostname,
      PORT: basePort + i,
    });

    const newWorkerPid = worker.process.pid;
    if (!newWorkerPid) {
      console.error("Something wrong: can't determine port of newly created worker");
    } else {
      activeWorkers.set(newWorkerPid, basePort + i);
    }
    workerPromises.push(
      new Promise((resolve) => {
        worker.on('message', (message: unknown) => {
          if (typeof message === 'number') {
            resolve();
            return;
          }
          const result = actOnWorkerMessage(controller, message);
          worker.send(JSON.stringify(result));
        });
      })
    );
  }
  return workerPromises;
};

export const startCluster = async (hostname: string, basePort: number): Promise<http.Server> => {
  const numCores = availableParallelism();
  const activeWorkers = new Map<number, number>();

  cluster.setupPrimary({
    exec: path.join(getModuleDirectory(import.meta.url), 'worker.ts'),
  });

  cluster.on('exit', (worker) => {
    handleWorkerExit(activeWorkers, hostname, worker);
  });

  await Promise.all(createWorkers(hostname, basePort, numCores, activeWorkers));

  return startHTTPServer(hostname, basePort, createBalancer(hostname, basePort + 1, numCores - 1));
};
