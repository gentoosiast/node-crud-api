import { Store } from './store.js';
import { Endpoint } from './types/http.js';
import { InvalidEndpointError, InvalidUUIDError, InvalidUserDataError } from './types/errors.js';
import { User, UserDto } from './types/users.js';
import { isUserDto, isUserId } from './helpers/validators.js';

export class Controller {
  constructor(private store = new Store()) {}

  public get(endpoint: string, userId?: string): User[] | User {
    if (endpoint === Endpoint.USERS) {
      return this.store.getAll();
    } else if (endpoint === Endpoint.USERS_WITH_ID) {
      if (!isUserId(userId)) {
        throw new InvalidUUIDError();
      }
      return this.store.getUserById(userId);
    } else {
      throw new InvalidEndpointError();
    }
  }

  public post(endpoint: string, bodyData?: string): User {
    if (endpoint !== Endpoint.USERS) {
      throw new InvalidEndpointError();
    }

    const userDto = this.parseBodyData(bodyData);

    return this.store.createUser(userDto);
  }

  public put(endpoint: string, userId?: string, bodyData?: string): User {
    if (endpoint !== Endpoint.USERS_WITH_ID) {
      throw new InvalidEndpointError();
    }

    const userDto = this.parseBodyData(bodyData);

    if (!isUserId(userId)) {
      throw new InvalidUUIDError();
    }

    return this.store.updateUser(userId, userDto);
  }

  public delete(endpoint: string, userId?: string): void {
    if (endpoint !== Endpoint.USERS_WITH_ID) {
      throw new InvalidEndpointError();
    }

    if (!isUserId(userId)) {
      throw new InvalidUUIDError();
    }

    this.store.deleteUser(userId);
  }

  private parseBodyData(bodyData: string | undefined): UserDto {
    if (!bodyData) {
      throw new InvalidUserDataError();
    }
    const body: unknown = JSON.parse(bodyData);
    if (!isUserDto(body)) {
      throw new InvalidUserDataError();
    }

    return body;
  }
}
