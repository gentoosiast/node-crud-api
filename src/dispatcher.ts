import http from 'node:http';
import { Controller } from './controller.js';
import { parseEndpoint } from './helpers/endpoints.js';
import { getRequestBody } from './helpers/request-body.js';
import { sendJSONResponse, sendErrorResponse } from './helpers/response.js';
import { InvalidHTTPMethodError } from './types/errors.js';
import { HTTPMethod, HTTPStatusCode } from './types/http.js';

export const processRequest = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  controller: Controller
): Promise<void> => {
  const { url = '' } = req;
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
};

export const createDispatcher = (): http.RequestListener => {
  const controller = new Controller();

  return async (req, res) => {
    try {
      await processRequest(req, res, controller);
    } catch (err) {
      sendErrorResponse(res, err);
    }
  };
};
