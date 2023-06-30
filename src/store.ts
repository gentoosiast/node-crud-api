import { User } from './types/users.js';
import { generateUUID, validateUUID } from './helpers/uuid.js';
import { validateUserDto } from './helpers/users.js';
import { InvalidUUIDError, InvalidUserDataError, UserNotFoundError } from './types/errors.js';

export class Store {
  constructor(private store: User[] = []) {}

  public getAll(): User[] {
    return this.store;
  }

  public getUserById(userId: string): User {
    const userIdx = this.findUserIndexByUserId(userId);

    return this.store[userIdx];
  }

  public createUser(userDto: unknown): User {
    if (!validateUserDto(userDto)) {
      throw new InvalidUserDataError();
    }

    const newUser = {
      ...userDto,
      id: generateUUID(),
    };

    this.store.push(newUser);

    return newUser;
  }

  public updateUser(userId: string, userDto: unknown): User {
    if (!validateUserDto(userDto)) {
      throw new InvalidUserDataError();
    }

    const userIdx = this.findUserIndexByUserId(userId);
    const user = this.store[userIdx];

    const updatedUser = {
      ...user,
      ...userDto,
      id: user.id,
    };

    this.store[userIdx] = updatedUser;

    return updatedUser;
  }

  public deleteUser(userId: string): void {
    const userIdx = this.findUserIndexByUserId(userId);

    this.store.splice(userIdx, 1);
  }

  private findUserIndexByUserId(userId: string): number {
    if (!validateUUID(userId)) {
      throw new InvalidUUIDError();
    }

    const userIdx = this.store.findIndex((user) => user.id === userId);

    if (userIdx === -1) {
      throw new UserNotFoundError();
    }

    return userIdx;
  }
}
