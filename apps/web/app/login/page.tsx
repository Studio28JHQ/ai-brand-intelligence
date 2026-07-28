import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { getTranslations } from '../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('loginMetaTitle'),
    description: t('loginMetaDescription'),
  };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <Suspense>
      <LoginForm title={t('signIn')} description={t('signInDescription')} />
    </Suspense>
  );
}
