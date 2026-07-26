'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { OtpPurpose } from '@ai-visibility/contracts';
import { AuthCard } from '../components/auth/AuthCard';
import { EmptyState } from '../components/ui';

export function VerificationSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const purpose = (searchParams.get('purpose') as OtpPurpose | null) ?? 'password-reset';

  return (
    <AuthCard title="Check your email">
      <EmptyState
        title={email ? `We sent a code to ${email}` : 'We sent you a code'}
        description="Enter it on the next screen to continue. The code expires soon, so check your inbox now."
        action={
          <Link
            href={`/verify-email?email=${encodeURIComponent(email)}&purpose=${purpose}`}
            className="btn btn-primary btn-sm"
          >
            Enter Code
          </Link>
        }
      />
    </AuthCard>
  );
}
