import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { loadConfig } from '@ai-visibility/config';

export interface SessionTokenPayload {
  sub: string;
  email: string;
}

export interface ResetTokenPayload {
  sub: string;
  purpose: 'password-reset';
}

/**
 * Session tokens are self-contained signed JWTs, not a persisted session table — chosen to avoid
 * a new stateful store for what this platform needs today (see `docs/04_PROJECT/AUTHENTICATION.md`
 * "Rejected Scope" for the tradeoff this implies). `apps/web` never verifies these itself; it only
 * relays the opaque token in an httpOnly cookie and forwards it back to this API, keeping the
 * signing secret — and all authentication logic — inside this one isolated module.
 */
@Injectable()
export class SessionTokenService {
  issueSessionToken(userId: string, email: string, rememberMe: boolean): { token: string; expiresInSeconds: number } {
    const config = loadConfig();
    const expiresInSeconds = rememberMe
      ? config.JWT_REMEMBER_ME_EXPIRATION_DAYS * 24 * 60 * 60
      : config.JWT_SESSION_EXPIRATION_MINUTES * 60;

    const payload: SessionTokenPayload = { sub: userId, email };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: expiresInSeconds });

    return { token, expiresInSeconds };
  }

  verifySessionToken(token: string): SessionTokenPayload | null {
    const config = loadConfig();
    try {
      return jwt.verify(token, config.JWT_SECRET) as SessionTokenPayload;
    } catch {
      return null;
    }
  }

  /** A short-lived proof that the OTP for a password reset was already verified — lets `/reset-password` change the password without re-collecting or re-checking the (already-consumed) OTP. */
  issueResetToken(userId: string): string {
    const config = loadConfig();
    const payload: ResetTokenPayload = { sub: userId, purpose: 'password-reset' };
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: 10 * 60 });
  }

  verifyResetToken(token: string): ResetTokenPayload | null {
    const config = loadConfig();
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as ResetTokenPayload;
      return decoded.purpose === 'password-reset' ? decoded : null;
    } catch {
      return null;
    }
  }
}
