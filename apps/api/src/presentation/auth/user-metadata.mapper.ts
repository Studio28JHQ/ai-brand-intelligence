import type { UserMetadata } from '@ai-visibility/contracts';
import { User } from '../../domain/user/user.entity';

export function toUserMetadata(user: User): UserMetadata {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    locale: user.locale,
  };
}
