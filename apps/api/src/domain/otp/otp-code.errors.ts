export class OtpCodeNotFoundError extends Error {
  constructor() {
    super('No active verification code found. Request a new one.');
    this.name = 'OtpCodeNotFoundError';
  }
}

export class OtpCodeExpiredError extends Error {
  constructor() {
    super('This verification code has expired. Request a new one.');
    this.name = 'OtpCodeExpiredError';
  }
}

export class OtpCodeAlreadyConsumedError extends Error {
  constructor() {
    super('This verification code has already been used. Request a new one.');
    this.name = 'OtpCodeAlreadyConsumedError';
  }
}

export class OtpCodeMismatchError extends Error {
  constructor() {
    super('Incorrect verification code.');
    this.name = 'OtpCodeMismatchError';
  }
}
