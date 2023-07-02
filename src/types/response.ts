import { HTTPStatusCode } from './http.js';

export interface ResponseSuccess {
  statusCode: HTTPStatusCode;
  data: unknown;
}

export interface ResponseError {
  statusCode: HTTPStatusCode;
  message: string;
}
