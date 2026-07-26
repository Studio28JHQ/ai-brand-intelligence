import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerificationSentContent } from './verification-sent-content';

export const metadata: Metadata = {
  title: 'Check Your Email — AI Visibility Auditor',
  description: 'We sent you a verification code.',
};

export default function VerificationSentPage() {
  return (
    <Suspense>
      <VerificationSentContent />
    </Suspense>
  );
}
