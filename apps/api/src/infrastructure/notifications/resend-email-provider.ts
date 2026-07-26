import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import { logger } from '@ai-visibility/shared';
import { EmailMessage, EmailProvider } from '../../application/notifications/email-provider';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Real transactional-email delivery via Resend's HTTP API (no SDK dependency — a single `fetch`
 * call). Bound instead of `ConsoleEmailProvider` when `EMAIL_PROVIDER=resend` (the default,
 * `presentation/auth/auth.module.ts`); `assertEmailProviderConfigured` (`@ai-visibility/config`)
 * refuses to even boot the API if `RESEND_API_KEY`/`EMAIL_FROM` are missing at that point, so this
 * class can assume both are present.
 */
@Injectable()
export class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    const config = loadConfig();

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(config.EMAIL_REPLY_TO ? { reply_to: config.EMAIL_REPLY_TO } : {}),
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Resend API rejected the email (HTTP ${response.status}): ${responseBody}`);
    }

    logger.info('Email delivered via Resend', { to: message.to, subject: message.subject });
  }
}
