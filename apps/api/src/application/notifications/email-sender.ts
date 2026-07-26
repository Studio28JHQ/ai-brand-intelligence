export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

/**
 * Provider-abstracted, mirroring `AiProvider` (`CTO-068`): the authentication domain calls only
 * this port, never a concrete email service, so a real transactional provider (SendGrid, SES,
 * SMTP via Nodemailer) can be bound in later purely by rebinding `EMAIL_SENDER` — no change to
 * any use case. No provider credentials exist in this environment today, so `ConsoleEmailSender`
 * is bound by default (see `infrastructure/notifications`).
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
