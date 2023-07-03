import http from 'node:http';
import { parseEndpoint } from './helpers/endpoints.js';
import { getRequestBody } from './helpers/request-body.js';
import { sendJSONResponse, sendPlaintextResponse, sendErrorResponse } from './helpers/response.js';
import { isParentMessage } from './helpers/validators.js';
import { InvalidHTTPMethodError, ServerError } from './types/errors.js';
import { HTTPMethod } from './types/http.js';
import { Result, WorkerMessage } from './types/worker.js';

const sendMessageToParent = (message: WorkerMessage): void => {
  process.send?.(JSON.stringify(message));
};

const actOnParentMessage = (res: http.ServerResponse, message: string): void => {
  try {
    const parentMessage: unknown = JSON.parse(message);
    if (!isParentMessage(parentMessage)) {
      throw new ServerError('Message received from parent have invalid format');
    }

    if (parentMessage.result === Result.Error) {
      const { statusCode, message } = parentMessage.response;
      sendPlaintextResponse(res, statusCode, message);
    } else {
      const { statusCode, data } = parentMessage.response;
      sendJSONResponse(res, statusCode, data);
    }
  } catch (err) {
    sendErrorResponse(res, err);
  }
};

export const createDispatcher = async (): Promise<http.RequestListener> => {
  return async (req, res) => {
    const { url = '' } = req;

    try {
      const { endpoint, userId } = parseEndpoint(url);

      switch (req.method) {
        case HTTPMethod.GET: {
          sendMessageToParent({ method: HTTPMethod.GET, endpoint, userId });
          break;
        }

        case HTTPMethod.POST: {
          const body = await getRequestBody(req);
          sendMessageToParent({ method: HTTPMethod.POST, endpoint, body });
          break;
        }

        case HTTPMethod.PUT: {
          const body = await getRequestBody(req);
          sendMessageToParent({ method: HTTPMethod.PUT, endpoint, userId, body });
          break;
        }

        case HTTPMethod.DELETE: {
          sendMessageToParent({ method: HTTPMethod.DELETE, endpoint, userId });
          break;
        }

        default: {
          throw new InvalidHTTPMethodError();
        }
      }
      process.once('message', (message: string) => actOnParentMessage(res, message));
    } catch (err) {
      sendErrorResponse(res, err);
    }
  };
};
