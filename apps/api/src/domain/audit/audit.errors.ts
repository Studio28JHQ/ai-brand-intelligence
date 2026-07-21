export class InvalidAuditUrlError extends Error {
  constructor(url: string) {
    super(`Invalid audit URL: ${url}`);
    this.name = 'InvalidAuditUrlError';
  }
}
