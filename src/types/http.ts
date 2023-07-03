export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum HTTPStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  ServerError = 500,
}

export enum Endpoint {
  USERS = '/api/users',
  USERS_WITH_ID = '/api/users/:userId',
}

export interface EndpointData {
  endpoint: Endpoint;
  userId?: string;
}
