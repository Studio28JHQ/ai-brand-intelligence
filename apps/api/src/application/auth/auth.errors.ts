export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Please verify your email before signing in.');
    this.name = 'EmailNotVerifiedError';
  }
}

export class PasswordConfirmationMismatchError extends Error {
  constructor() {
    super('Password and confirmation do not match.');
    this.name = 'PasswordConfirmationMismatchError';
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super('This password reset link is invalid or has expired.');
    this.name = 'InvalidResetTokenError';
  }
}
