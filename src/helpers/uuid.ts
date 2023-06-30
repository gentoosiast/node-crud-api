import { randomUUID } from 'node:crypto';

const UUIDv4REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

export const generateUUID = (): string => {
  return randomUUID();
};

export const validateUUID = (value: string): boolean => {
  return UUIDv4REGEX.test(value);
};
