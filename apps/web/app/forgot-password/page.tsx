import type { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';
import { getTranslations } from '../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('forgotPasswordMetaTitle'),
    description: t('forgotPasswordMetaDescription'),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
