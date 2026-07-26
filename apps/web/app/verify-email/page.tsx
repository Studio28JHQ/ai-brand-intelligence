import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from './verify-email-form';

export const metadata: Metadata = {
  title: 'Verify Your Email — AI Visibility Auditor',
  description: 'Enter the 6-digit verification code we sent you.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
