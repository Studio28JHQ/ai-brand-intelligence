export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`An account already exists for email: ${email}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidUserStateTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition user from '${from}' to '${to}'.`);
    this.name = 'InvalidUserStateTransitionError';
  }
}
