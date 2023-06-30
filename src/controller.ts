import http from 'node:http';
import { Store } from './store.js';
import { Endpoint, EndpointData, HTTPStatusCode } from './types/http.js';
import { InvalidEndpointError } from './types/errors.js';
import { sendJSONResponse } from './helpers/response.js';

export class Controller {
  constructor(private store = new Store()) {}

  public get(endpointData: EndpointData, res: http.ServerResponse): void {
    if (endpointData.endpoint === Endpoint.USERS) {
      res.statusCode = HTTPStatusCode.OK;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(this.store.getAll()));
    } else if (endpointData.endpoint === Endpoint.USERS_WITH_ID) {
      res.statusCode = HTTPStatusCode.OK;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(this.store.getUserById(endpointData.userId ?? '')));
    } else {
      throw new InvalidEndpointError();
    }
  }

  public post(endpointData: EndpointData, bodyData: string, res: http.ServerResponse): void {
    if (endpointData.endpoint !== Endpoint.USERS) {
      throw new InvalidEndpointError();
    }
    const body = JSON.parse(bodyData);

    const user = this.store.createUser(body);
    sendJSONResponse(res, HTTPStatusCode.Created, user);
  }

  public put(endpointData: EndpointData, bodyData: string, res: http.ServerResponse): void {
    if (endpointData.endpoint !== Endpoint.USERS_WITH_ID) {
      throw new InvalidEndpointError();
    }
    const body = JSON.parse(bodyData);

    const user = this.store.updateUser(endpointData.userId ?? '', body);
    sendJSONResponse(res, HTTPStatusCode.OK, user);
  }

  public delete(endpointData: EndpointData, res: http.ServerResponse): void {
    if (endpointData.endpoint !== Endpoint.USERS_WITH_ID) {
      throw new InvalidEndpointError();
    }

    this.store.deleteUser(endpointData.userId ?? '');
    sendJSONResponse(res, HTTPStatusCode.NoContent);
  }
}
