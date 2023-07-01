import { ErrorMessage, ErrorType } from './errors.js';
import { HTTPStatusCode } from './http.js';

export interface ResponseSuccess {
  statusCode: HTTPStatusCode;
  data: unknown;
}

export interface ResponseError {
  statusCode: HTTPStatusCode;
  type: ErrorType;
  message: ErrorMessage;
}

export const ErrorResponses: Map<ErrorType, ResponseError> = new Map([
  [
    ErrorType.SyntaxError,
    {
      type: ErrorType.SyntaxError,
      statusCode: HTTPStatusCode.BadRequest,
      message: ErrorMessage.InvalidUserDataError,
    },
  ],
  [
    ErrorType.InvalidUUIDError,
    {
      type: ErrorType.InvalidUUIDError,
      statusCode: HTTPStatusCode.BadRequest,
      message: ErrorMessage.InvalidUUIDError,
    },
  ],
  [
    ErrorType.InvalidUserDataError,
    {
      type: ErrorType.InvalidUserDataError,
      statusCode: HTTPStatusCode.BadRequest,
      message: ErrorMessage.InvalidUserDataError,
    },
  ],
  [
    ErrorType.UserNotFoundError,
    {
      type: ErrorType.UserNotFoundError,
      statusCode: HTTPStatusCode.NotFound,
      message: ErrorMessage.UserNotFoundError,
    },
  ],
  [
    ErrorType.InvalidEndpointError,
    {
      type: ErrorType.InvalidEndpointError,
      statusCode: HTTPStatusCode.NotFound,
      message: ErrorMessage.InvalidEndpointError,
    },
  ],
  [
    ErrorType.InvalidHTTPMethodError,
    {
      type: ErrorType.InvalidHTTPMethodError,
      statusCode: HTTPStatusCode.BadRequest,
      message: ErrorMessage.InvalidHTTPMethodError,
    },
  ],
]);
