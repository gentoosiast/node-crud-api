import http from 'node:http';
import { Controller } from './controller.js';
import { HTTPMethod } from './types/http.js';
import { parseEndpoint } from './helpers/endpoints.js';
import { sendPlaintextResponse } from './helpers/response.js';
import { getRequestBody } from './helpers/request-body.js';
import { HTTPStatusCode } from './types/http.js';
import {
  InvalidEndpointError,
  InvalidHTTPMethodError,
  InvalidUUIDError,
  InvalidUserDataError,
  UserNotFoundError,
} from './types/errors.js';

const controller = new Controller();

const handleError = (res: http.ServerResponse, err: unknown): void => {
  if (err instanceof InvalidUUIDError) {
    sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
  } else if (err instanceof InvalidUserDataError) {
    sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
  } else if (err instanceof UserNotFoundError) {
    sendPlaintextResponse(res, HTTPStatusCode.NotFound, `Error: ${err.message}`);
  } else if (err instanceof InvalidEndpointError) {
    sendPlaintextResponse(res, HTTPStatusCode.NotFound, `Error: ${err.message}`);
  } else if (err instanceof InvalidHTTPMethodError) {
    sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
  } else {
    sendPlaintextResponse(res, HTTPStatusCode.BadRequest, 'Error: Unknown error');
  }
};

export const dispatcher = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
  const { url: endpoint = '' } = req;

  try {
    const endpointData = parseEndpoint(endpoint);

    switch (req.method) {
      case HTTPMethod.GET: {
        controller.get(endpointData, res);
        break;
      }

      case HTTPMethod.POST: {
        const body = await getRequestBody(req);
        controller.post(endpointData, body, res);
        break;
      }

      case HTTPMethod.PUT: {
        const body = await getRequestBody(req);
        controller.put(endpointData, body, res);
        break;
      }

      case HTTPMethod.DELETE: {
        controller.delete(endpointData, res);
        break;
      }

      default: {
        throw new InvalidHTTPMethodError();
      }
    }
  } catch (err) {
    handleError(res, err);
  }
};
