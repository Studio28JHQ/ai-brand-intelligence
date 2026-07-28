import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { getTranslations } from '../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'Sign In — AI Visibility Auditor',
  description: 'Sign in to AI Visibility Auditor.',
};

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <Suspense>
      <LoginForm title={t('signIn')} description={t('signInDescription')} />
    </Suspense>
  );
}
