import { HTTPStatusCode } from './http.js';

export enum ErrorMessage {
  InvalidUUIDError = 'Invalid UUID format',
  InvalidUserDataError = 'Invalid user data: required fields are missing or have wrong format',
  UserNotFoundError = 'User not found',
  InvalidEndpointError = 'Request to non-existing endpoint',
  InvalidHTTPMethodError = 'Invalid HTTP method',
  ServerError = 'Server error',
  UnknownError = 'Error: Unknown error',
}

export class HTTPError extends Error {
  constructor(message: string = ErrorMessage.ServerError, public statusCode = HTTPStatusCode.ServerError) {
    super(message);
  }
}

export class InvalidUUIDError extends HTTPError {
  constructor(message: string = ErrorMessage.InvalidUUIDError, public statusCode = HTTPStatusCode.BadRequest) {
    super(message);
  }
}

export class InvalidUserDataError extends HTTPError {
  constructor(message: string = ErrorMessage.InvalidUserDataError, public statusCode = HTTPStatusCode.BadRequest) {
    super(message);
  }
}

export class UserNotFoundError extends HTTPError {
  constructor(message: string = ErrorMessage.UserNotFoundError, public statusCode = HTTPStatusCode.NotFound) {
    super(message);
  }
}

export class InvalidEndpointError extends HTTPError {
  constructor(message: string = ErrorMessage.InvalidEndpointError, public statusCode = HTTPStatusCode.NotFound) {
    super(message);
  }
}

export class InvalidHTTPMethodError extends HTTPError {
  constructor(message: string = ErrorMessage.InvalidHTTPMethodError, public statusCode = HTTPStatusCode.BadRequest) {
    super(message);
  }
}

export class ServerError extends HTTPError {
  constructor(message: string = ErrorMessage.ServerError, public statusCode = HTTPStatusCode.ServerError) {
    super(message);
  }
}
