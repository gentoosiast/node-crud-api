import { User, UserDto, UserId } from './types/users.js';
import { generateUUID } from './helpers/uuid.js';
import { UserNotFoundError } from './types/errors.js';

export class Store {
  constructor(private store: User[] = []) {}

  public getAll(): User[] {
    return this.store;
  }

  public getUserById(userId: UserId): User {
    const userIdx = this.findUserIndexByUserId(userId);

    return this.store[userIdx];
  }

  public createUser(userDto: UserDto): User {
    const newUser = {
      ...userDto,
      id: generateUUID(),
    };

    this.store.push(newUser);

    return newUser;
  }

  public updateUser(userId: UserId, userDto: UserDto): User {
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

  public deleteUser(userId: UserId): void {
    const userIdx = this.findUserIndexByUserId(userId);

    this.store.splice(userIdx, 1);
  }

  private findUserIndexByUserId(userId: UserId): number {
    const userIdx = this.store.findIndex((user) => user.id === userId);

    if (userIdx === -1) {
      throw new UserNotFoundError();
    }

    return userIdx;
  }
}
