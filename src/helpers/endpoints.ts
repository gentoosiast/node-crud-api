import { Endpoint, EndpointData } from '../types/http.js';
import { InvalidEndpointError } from '../types/errors.js';

export const parseEndpoint = (endpoint: string): EndpointData => {
  if (/^\/api\/users\/?$/.test(endpoint)) {
    return {
      endpoint: Endpoint.USERS,
      userId: null,
    };
  }

  if (/^\/api\/users\/[^/]+$/.test(endpoint)) {
    const userId = endpoint.match(/[^/]+$/)?.[0] ?? '';

    return {
      endpoint: Endpoint.USERS_WITH_ID,
      userId,
    };
  }

  throw new InvalidEndpointError();
};
