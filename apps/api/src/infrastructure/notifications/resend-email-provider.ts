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
 *
 * Logs the full request/response trail (sender, recipient, HTTP status, Resend's raw response body
 * — including the generated email id on success) on both the success and failure path, never just a
 * one-line summary — a rejected-but-swallowed API response was exactly what made prior delivery
 * failures hard to diagnose (`F9-S02-HF04`).
 */
@Injectable()
export class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    const config = loadConfig();

    const payload = {
      from: config.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(config.EMAIL_REPLY_TO ? { reply_to: config.EMAIL_REPLY_TO } : {}),
    };

    logger.info('Resend request', {
      provider: 'resend',
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      replyTo: config.EMAIL_REPLY_TO ?? null,
    });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      logger.error('Resend API rejected the email', {
        from: payload.from,
        to: payload.to,
        httpStatus: response.status,
        responseBody,
      });
      throw new Error(`Resend API rejected the email (HTTP ${response.status}): ${responseBody}`);
    }

    let emailId: string | undefined;
    try {
      emailId = (JSON.parse(responseBody) as { id?: string }).id;
    } catch {
      emailId = undefined;
    }

    logger.info('Email delivered via Resend', {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      httpStatus: response.status,
      emailId: emailId ?? null,
      responseBody,
    });
  }
}
