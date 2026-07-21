import { InvalidAuditUrlError } from './audit.errors';

export class AuditUrl {
  private constructor(public readonly value: string) {}

  static create(raw: string): AuditUrl {
    let parsed: URL;

    try {
      parsed = new URL(raw);
    } catch {
      throw new InvalidAuditUrlError(raw);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new InvalidAuditUrlError(raw);
    }

    return new AuditUrl(raw);
  }
}
