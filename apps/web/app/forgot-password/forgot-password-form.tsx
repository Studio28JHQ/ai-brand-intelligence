'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { Banner } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);

    const result = await forgotPassword(email);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/verification-sent?email=${encodeURIComponent(email)}&purpose=password-reset`);
  };

  return (
    <AuthCard title={t('forgotPasswordTitle')} description={t('forgotPasswordDescription')}>
      <form onSubmit={handleSubmit} className="stack">
        <div className="field">
          <label htmlFor="email">{t('email')}</label>
          <input
            className="input"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {error && <Banner variant="error">{error}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t('sendingCode') : t('sendResetCode')}
        </button>

        <p className="text-secondary">
          <Link href="/login">{t('backToSignIn')}</Link>
        </p>
      </form>
    </AuthCard>
  );
}
