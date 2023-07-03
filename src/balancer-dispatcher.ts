import http from 'node:http';
import { getRequestBody } from './helpers/request-body.js';
import { sendErrorResponse } from './helpers/response.js';
import { ServerError } from './types/errors.js';

const handleResponse = (workerResponse: http.IncomingMessage, res: http.ServerResponse): void => {
  const { statusCode } = workerResponse;
  const contentType = workerResponse.headers['content-type'];
  if (!statusCode) {
    throw new ServerError("Response from worker doesn't contain status code");
  }
  if (!contentType) {
    throw new ServerError("Response from worker doesn't contain 'Content-Type' header");
  }
  res.statusCode = statusCode;
  res.setHeader('content-type', contentType);
  workerResponse.pipe(res).on('error', (err) => {
    throw new ServerError(`There was a problem piping response from worker to client: ${err.message}`);
  });
};

export const createBalancer = (
  workerHostname: string,
  workerStartPort: number,
  numWorkers: number
): http.RequestListener => {
  let currentWorkerIdx = 0;

  return async (req, res) => {
    try {
      console.log(
        `Load balancer dispatching request to http://${workerHostname}:${workerStartPort + currentWorkerIdx}`
      );
      const request = http.request(
        {
          hostname: workerHostname,
          port: workerStartPort + currentWorkerIdx,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (response) => handleResponse(response, res)
      );
      request.on('error', (err) => {
        throw new ServerError(`There was a problem with a request to worker: ${err.message}`);
      });
      const responseBody = await getRequestBody(req);
      request.write(responseBody);
      request.end();
      currentWorkerIdx = (currentWorkerIdx + 1) % numWorkers;
    } catch (err) {
      sendErrorResponse(res, err);
    }
  };
};
