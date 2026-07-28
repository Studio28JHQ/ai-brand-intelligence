import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerificationSentContent } from './verification-sent-content';
import { getTranslations } from '../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('verificationSentMetaTitle'),
    description: t('verificationSentMetaDescription'),
  };
}

export default function VerificationSentPage() {
  return (
    <Suspense>
      <VerificationSentContent />
    </Suspense>
  );
}
