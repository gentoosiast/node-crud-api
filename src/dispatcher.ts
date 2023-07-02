import http from 'node:http';
import { Controller } from './controller.js';
import { parseEndpoint } from './helpers/endpoints.js';
import { getRequestBody } from './helpers/request-body.js';
import { sendJSONResponse, sendErrorResponse } from './helpers/response.js';
import { HTTPMethod, HTTPStatusCode } from './types/http.js';
import { InvalidHTTPMethodError } from './types/errors.js';

const controller = new Controller();

export const dispatcher = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
  const { url = '' } = req;

  try {
    const { endpoint, userId } = parseEndpoint(url);
    switch (req.method) {
      case HTTPMethod.GET: {
        const result = controller.get(endpoint, userId);
        sendJSONResponse(res, HTTPStatusCode.OK, result);
        break;
      }

      case HTTPMethod.POST: {
        const body = await getRequestBody(req);
        const result = controller.post(endpoint, body);
        sendJSONResponse(res, HTTPStatusCode.Created, result);
        break;
      }

      case HTTPMethod.PUT: {
        const body = await getRequestBody(req);
        const result = controller.put(endpoint, userId, body);
        sendJSONResponse(res, HTTPStatusCode.OK, result);
        break;
      }

      case HTTPMethod.DELETE: {
        controller.delete(endpoint, userId);
        sendJSONResponse(res, HTTPStatusCode.NoContent);
        break;
      }

      default: {
        throw new InvalidHTTPMethodError();
      }
    }
  } catch (err) {
    sendErrorResponse(res, err);
  }
};
