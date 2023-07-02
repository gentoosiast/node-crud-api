import http from 'node:http';
import { parseEndpoint } from './helpers/endpoints.js';
import { HTTPMethod } from './types/http.js';
import { ErrorMessage, InvalidHTTPMethodError, ServerError } from './types/errors.js';
import { Result, WorkerMessage } from './types/worker.js';
import { getRequestBody } from './helpers/request-body.js';
import { isParentMessage } from './helpers/validators.js';
import { sendJSONResponse, sendPlaintextResponse } from './helpers/response.js';
import { sendErrorResponse } from './error-handler.js';

const sendMessageToParent = (message: WorkerMessage): void => {
  process.send?.(JSON.stringify(message));
};

const actOnParentMessage = (res: http.ServerResponse, message: string): void => {
  console.error(`got message from parent: ${process.env.PORT} ${message}`);
  try {
    const parentMessage: unknown = JSON.parse(message);
    if (!isParentMessage(parentMessage)) {
      throw new ServerError('Parent message have invalid format' as ErrorMessage);
    }
    if (parentMessage.result === Result.Error) {
      const { statusCode, message } = parentMessage.response;
      sendPlaintextResponse(res, statusCode, message);
    } else if (parentMessage.result === Result.Success) {
      const { statusCode, data } = parentMessage.response;
      sendJSONResponse(res, statusCode, data);
    } else {
      throw new Error('Unknown parent message result');
    }
  } catch (err) {
    console.error(err);
    res.end();
  }
};

export const dispatcher = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
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
