import { Injectable } from '@nestjs/common';
import { logger } from '@ai-visibility/shared';
import { EmailMessage, EmailSender } from '../../application/notifications/email-sender';

/**
 * Dev/pilot-appropriate default: no SMTP/transactional-email provider is configured anywhere in
 * this environment, so this writes the message to the structured log instead of failing or
 * silently dropping it — the same "no real provider configured, so make the behavior visible and
 * honest rather than fake it" posture already used for `NoOpAiProvider` before `F7-S03` bound a
 * real one. Swapping in a real provider later is a DI rebind only (`EMAIL_SENDER`), never a change
 * to `RegisterUserUseCase`/`ForgotPasswordUseCase`/etc.
 */
@Injectable()
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    logger.info('Email dispatched (console provider — EMAIL_PROVIDER=console, not delivered to a real inbox)', {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
