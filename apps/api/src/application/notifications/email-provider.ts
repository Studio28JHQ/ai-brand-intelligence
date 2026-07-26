export const EMAIL_PROVIDER_TOKEN = Symbol('EMAIL_PROVIDER');

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Provider-abstracted, mirroring `AiProvider` (`CTO-068`): the authentication domain calls only
 * this port, never a concrete email service, so a real transactional provider (Resend today;
 * SES/Postmark/SendGrid/Mailgun would each be one new class implementing this same interface) can
 * be bound in purely via `EMAIL_PROVIDER` — no change to any use case (`F9-S02-HF02`,
 * `F9-S02-HF03`). Named `EMAIL_PROVIDER_TOKEN` (not `EMAIL_PROVIDER`) to stay visually distinct
 * from `PlatformConfig.EMAIL_PROVIDER`, the env-driven string ('console' | 'resend') that selects
 * which class this token resolves to. Both `html` and `text` are required so every provider sends
 * a proper multipart email, not just plain text.
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}
