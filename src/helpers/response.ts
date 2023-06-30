import http from 'node:http';
import { HTTPStatusCode } from '../types/http.js';

export const sendPlaintextResponse = (res: http.ServerResponse, statusCode: HTTPStatusCode, data: string): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain');
  res.end(data);
};

export const sendJSONResponse = (res: http.ServerResponse, statusCode: HTTPStatusCode, data: unknown): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};
