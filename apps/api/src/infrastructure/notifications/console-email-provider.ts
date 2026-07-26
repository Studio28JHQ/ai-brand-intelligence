import { Injectable } from '@nestjs/common';
import { logger } from '@ai-visibility/shared';
import { EmailMessage, EmailProvider } from '../../application/notifications/email-provider';

/**
 * Explicit local-development opt-out (`EMAIL_PROVIDER=console`) — writes the message to the
 * structured log instead of delivering it, rather than failing or silently dropping it, the same
 * "make the behavior visible and honest rather than fake it" posture already used for
 * `NoOpAiProvider` before `F7-S03` bound a real one. Swapping providers is a DI rebind only
 * (`EMAIL_PROVIDER_TOKEN`, `presentation/auth/auth.module.ts`), never a change to
 * `RegisterUserUseCase`/`ForgotPasswordUseCase`/etc.
 */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info('Email dispatched (console provider — EMAIL_PROVIDER=console, not delivered to a real inbox)', {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
