import { UserDto } from '../types/users.js';

export const validateUserDto = (value: unknown): value is UserDto => {
  if (
    value &&
    typeof value === 'object' &&
    'username' in value &&
    Object.prototype.hasOwnProperty.call(value, 'username') &&
    typeof value.username === 'string' &&
    'age' in value &&
    Object.prototype.hasOwnProperty.call(value, 'age') &&
    typeof value.age === 'number' &&
    'hobbies' in value &&
    Object.prototype.hasOwnProperty.call(value, 'hobbies') &&
    Array.isArray(value.hobbies) &&
    value.hobbies.every((hobby) => typeof hobby === 'string')
  ) {
    return true;
  }

  return false;
};
