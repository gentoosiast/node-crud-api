import http from 'node:http';
import { HTTPError } from '../types/errors.js';
import { HTTPStatusCode } from '../types/http.js';

export const sendPlaintextResponse = (res: http.ServerResponse, statusCode: HTTPStatusCode, data: string): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain');
  res.end(data);
};

export const sendJSONResponse = (res: http.ServerResponse, statusCode: HTTPStatusCode, data?: unknown): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  if (data) {
    res.end(JSON.stringify(data));
  } else {
    res.end();
  }
};

export const sendErrorResponse = (res: http.ServerResponse, err: unknown): void => {
  if (err instanceof HTTPError) {
    sendPlaintextResponse(res, err.statusCode, err.message);
  } else if (err instanceof Error) {
    sendPlaintextResponse(res, HTTPStatusCode.ServerError, err.message);
  } else {
    sendPlaintextResponse(res, HTTPStatusCode.ServerError, 'Unknown error');
  }
};
