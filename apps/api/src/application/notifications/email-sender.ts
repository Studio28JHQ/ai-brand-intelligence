export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Provider-abstracted, mirroring `AiProvider` (`CTO-068`): the authentication domain calls only
 * this port, never a concrete email service, so a real transactional provider (Resend today;
 * SendGrid/Postmark/SES/SMTP would each be one new class implementing this same interface) can be
 * bound in purely via `EMAIL_PROVIDER` — no change to any use case (`F9-S02-HF02`). Both `html`
 * and `text` are required so every provider can send a proper multipart email, not just plain text.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
