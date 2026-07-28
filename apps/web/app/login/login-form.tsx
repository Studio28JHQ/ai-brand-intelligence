'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser, resendOtp } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';

export function LoginForm({ title, description }: { title: string; description: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  const justVerified = searchParams.get('verified') === '1';
  const justReset = searchParams.get('reset') === '1';
  const isUnverifiedError = error === 'Please verify your email before signing in.';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setResent(false);
    setSubmitting(true);

    const result = await loginUser({ email, password, rememberMe });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/workspace');
  };

  const handleResend = async () => {
    const result = await resendOtp(email, 'email-verification');
    if (!result.error) {
      setResent(true);
    }
  };

  return (
    <AuthCard title={title} description={description}>
      <form onSubmit={handleSubmit} className="stack">
        {justVerified && <Banner variant="success">{t('justVerifiedMessage')}</Banner>}
        {justReset && <Banner variant="success">{t('justResetMessage')}</Banner>}

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

        <PasswordField id="password" label={t('password')} value={password} onChange={setPassword} autoComplete="current-password" />

        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <label className="cluster" style={{ gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            {t('rememberMe')}
          </label>
          <Link href="/forgot-password" className="text-secondary">
            {t('forgotPassword')}
          </Link>
        </div>

        {error && (
          <Banner variant="error">
            {error}
            {isUnverifiedError && (
              <>
                {' '}
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend}>
                  {t('resendVerificationCode')}
                </button>
              </>
            )}
          </Banner>
        )}
        {resent && <Banner variant="success">{t('verificationCodeResent')}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t('signingIn') : t('signIn')}
        </button>

        <p className="text-secondary">
          {t('dontHaveAccount')} <Link href="/register">{t('signUp')}</Link>
        </p>
      </form>
    </AuthCard>
  );
}
