import http from 'node:http';
import { Store } from './store.js';
import { Endpoint, EndpointData, HTTPStatusCode } from './types/http.js';
import { InvalidEndpointError, InvalidUUIDError, InvalidUserDataError, UserNotFoundError } from './types/errors.js';
import { sendPlaintextResponse, sendJSONResponse } from './helpers/response.js';

export class Controller {
  constructor(private store = new Store()) {}

  public get(endpointData: EndpointData, res: http.ServerResponse): void {
    if (endpointData.endpoint === Endpoint.USERS) {
      res.statusCode = HTTPStatusCode.OK;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(this.store.getAll()));
    }

    if (endpointData.endpoint === Endpoint.USERS_WITH_ID) {
      try {
        res.statusCode = HTTPStatusCode.OK;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.store.getUserById(endpointData.userId ?? '')));
      } catch (err) {
        if (err instanceof InvalidUUIDError) {
          sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
        } else if (err instanceof UserNotFoundError) {
          sendPlaintextResponse(res, HTTPStatusCode.NotFound, `Error: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
  }

  public post(endpointData: EndpointData, bodyData: string, res: http.ServerResponse): void {
    try {
      if (endpointData.endpoint !== Endpoint.USERS) {
        throw new InvalidEndpointError();
      }
      const body = JSON.parse(bodyData);

      const user = this.store.createUser(body);
      sendJSONResponse(res, HTTPStatusCode.Created, user);
    } catch (err) {
      if (err instanceof SyntaxError) {
        sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
      } else if (err instanceof InvalidUserDataError) {
        sendPlaintextResponse(res, HTTPStatusCode.BadRequest, `Error: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
}
