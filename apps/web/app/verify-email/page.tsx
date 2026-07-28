import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from './verify-email-form';
import { getTranslations } from '../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('verifyEmailMetaTitle'),
    description: t('verifyEmailMetaDescription'),
  };
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
