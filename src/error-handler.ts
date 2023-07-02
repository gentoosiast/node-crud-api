import http from 'node:http';
import { sendPlaintextResponse } from './helpers/response.js';
import { HTTPError } from './types/errors.js';
import { HTTPStatusCode } from './types/http.js';

export const handleError = (err: Error, res: http.ServerResponse): void => {
  if (err instanceof HTTPError) {
    sendPlaintextResponse(res, err.statusCode, err.message);
  } else if (err instanceof Error) {
    sendPlaintextResponse(res, HTTPStatusCode.ServerError, err.message);
  } else {
    sendPlaintextResponse(res, HTTPStatusCode.ServerError, 'Unknown error');
  }
};
