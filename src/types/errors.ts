export class InvalidUUIDError extends Error {
  constructor(message = 'Invalid UUID format') {
    super(message);
  }
}

export class InvalidUserDataError extends Error {
  constructor(message = 'Invalid user data: required fields are missing or have wrong format') {
    super(message);
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
  }
}

export class InvalidEndpointError extends Error {
  constructor(message = 'Request to non-existing endpoint') {
    super(message);
  }
}

export class InvalidHTTPMethodError extends Error {
  constructor(message = 'Invalid HTTP method') {
    super(message);
  }
}
