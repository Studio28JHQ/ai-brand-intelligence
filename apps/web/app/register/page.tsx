import type { Metadata } from 'next';
import { RegisterForm } from './register-form';
import { getTranslations } from '../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('registerMetaTitle'),
    description: t('registerMetaDescription'),
  };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
