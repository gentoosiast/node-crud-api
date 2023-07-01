import { ErrorMessage, ErrorType } from '../types/errors.js';
import { HTTPMethod, HTTPStatusCode } from '../types/http.js';
import { ResponseError, ResponseSuccess } from '../types/response.js';
import { UserDto, UserId } from '../types/users.js';
import { ParentMessage, Result, WorkerMessage } from '../types/worker.js';

const UUIDv4REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

export const isMemberOfStringEnum = <T>(enumObj: { [key: string]: T }, value: unknown): value is T => {
  if (typeof value === 'string' && Object.values(enumObj).includes(value as T)) {
    return true;
  }

  return false;
};

export const isHTTPStatusCode = (value: unknown): value is HTTPStatusCode => {
  if (typeof value === 'number' && Object.values(HTTPStatusCode).includes(value)) {
    return true;
  }

  return false;
};

export const isWorkerMessage = (message: unknown): message is WorkerMessage => {
  if (
    message &&
    typeof message === 'object' &&
    'method' in message &&
    isMemberOfStringEnum(HTTPMethod, message.method) &&
    'endpoint' in message &&
    typeof message.endpoint === 'string'
  ) {
    return true;
  }

  return false;
};

export const isResponseError = (message: unknown): message is ResponseError => {
  if (
    message &&
    typeof message === 'object' &&
    'statusCode' in message &&
    isHTTPStatusCode(message.statusCode) &&
    'type' in message &&
    isMemberOfStringEnum(ErrorType, message.type) &&
    'message' in message &&
    isMemberOfStringEnum(ErrorMessage, message.message)
  ) {
    return true;
  }

  return false;
};

export const isResponseSuccess = (message: unknown): message is ResponseSuccess => {
  if (message && typeof message === 'object' && 'statusCode' in message && isHTTPStatusCode(message.statusCode)) {
    return true;
  }

  return false;
};

export const isParentMessage = (message: unknown): message is ParentMessage => {
  if (
    message &&
    typeof message === 'object' &&
    'result' in message &&
    isMemberOfStringEnum(Result, message.result) &&
    'response' in message &&
    ((message.result === Result.Success && isResponseSuccess(message.response)) ||
      (message.result === Result.Error && isResponseError(message.response)))
  ) {
    return true;
  }

  return false;
};

export const isUserDto = (value: unknown): value is UserDto => {
  if (
    value &&
    typeof value === 'object' &&
    'username' in value &&
    Object.prototype.hasOwnProperty.call(value, 'username') &&
    typeof value.username === 'string' &&
    'age' in value &&
    Object.prototype.hasOwnProperty.call(value, 'age') &&
    typeof value.age === 'number' &&
    'hobbies' in value &&
    Object.prototype.hasOwnProperty.call(value, 'hobbies') &&
    Array.isArray(value.hobbies) &&
    value.hobbies.every((hobby) => typeof hobby === 'string')
  ) {
    return true;
  }

  return false;
};

export const isUserId = (value: unknown): value is UserId => {
  if (typeof value !== 'string') {
    return false;
  }

  return UUIDv4REGEX.test(value);
};
