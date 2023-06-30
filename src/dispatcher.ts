import http from 'node:http';
import { Controller } from './controller.js';
import { HTTPMethod } from './types/http.js';
import { parseEndpoint } from './helpers/endpoints.js';
import { sendPlaintextResponse } from './helpers/response.js';
import { getRequestBody } from './helpers/request-body.js';
import { HTTPStatusCode } from './types/http.js';
import { InvalidEndpointError, InvalidHTTPMethodError } from './types/errors.js';

const controller = new Controller();

const handleError = (res: http.ServerResponse, err: unknown): void => {
  if (err instanceof InvalidEndpointError) {
    sendPlaintextResponse(res, HTTPStatusCode.NotFound, `Error: ${err.message}`);
  }

  if (err instanceof InvalidHTTPMethodError) {
    sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
  }

  sendPlaintextResponse(res, HTTPStatusCode.BadRequest, 'Error: Unknown error');
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
        //
        break;
      }

      case HTTPMethod.DELETE: {
        //
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
