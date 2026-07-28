'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { OtpPurpose } from '@ai-visibility/contracts';
import { AuthCard } from '../components/auth/AuthCard';
import { EmptyState } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';

export function VerificationSentContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const purpose = (searchParams.get('purpose') as OtpPurpose | null) ?? 'password-reset';

  return (
    <AuthCard title={t('checkYourEmailTitle')}>
      <EmptyState
        title={email ? t('weSentCodeToShort', { email }) : t('weSentYouCode')}
        description={t('enterCodeNextScreen')}
        action={
          <Link
            href={`/verify-email?email=${encodeURIComponent(email)}&purpose=${purpose}`}
            className="btn btn-primary btn-sm"
          >
            {t('enterCode')}
          </Link>
        }
      />
    </AuthCard>
  );
}
