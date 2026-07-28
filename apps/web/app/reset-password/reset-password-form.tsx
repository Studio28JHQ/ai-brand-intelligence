'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner, EmptyState } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthCard title={t('resetYourPasswordTitle')}>
        <EmptyState
          title={t('linkInvalidTitle')}
          description={t('linkInvalidDescription')}
          action={
            <a href="/forgot-password" className="btn btn-primary btn-sm">
              {t('requestNewCode')}
            </a>
          }
        />
      </AuthCard>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);

    if (newPassword !== confirmNewPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(token, newPassword, confirmNewPassword);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/login?reset=1');
  };

  return (
    <AuthCard title={t('setNewPasswordTitle')}>
      <form onSubmit={handleSubmit} className="stack">
        <PasswordField
          id="newPassword"
          label={t('newPasswordLabel')}
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <p className="field-hint">{t('passwordHint')}</p>

        <PasswordField
          id="confirmNewPassword"
          label={t('confirmNewPasswordLabel')}
          value={confirmNewPassword}
          onChange={setConfirmNewPassword}
          autoComplete="new-password"
        />

        {error && <Banner variant="error">{error}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t('resetting') : t('resetPasswordButton')}
        </button>
      </form>
    </AuthCard>
  );
}
