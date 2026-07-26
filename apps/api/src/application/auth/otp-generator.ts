import { randomInt, createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

/**
 * OTP codes are short-lived, single-use, and already rate-limited at the endpoint level — a fast
 * SHA-256 digest (rather than `bcrypt`'s deliberately slow cost function, reserved for long-lived
 * password hashes) is the appropriate strength here, while still never persisting the raw code.
 */
@Injectable()
export class OtpGenerator {
  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  hash(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  matches(code: string, codeHash: string): boolean {
    return this.hash(code) === codeHash;
  }
}
