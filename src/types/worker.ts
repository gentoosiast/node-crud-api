import { HTTPMethod , Endpoint } from './http.js';
import { ResponseError, ResponseSuccess } from './response.js';

export enum Result {
  Error = 'error',
  Success = 'success',
}

export interface WorkerMessage {
  method: HTTPMethod;
  endpoint: Endpoint;
  userId?: string;
  body?: string;
}

export type ParentMessage =
  | { result: Result.Error; response: ResponseError }
  | { result: Result.Success; response: ResponseSuccess };
