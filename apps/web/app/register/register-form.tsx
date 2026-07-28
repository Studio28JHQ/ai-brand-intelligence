'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';

export function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const result = await registerUser({ firstName, lastName, email, password, confirmPassword });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const emailDeliveredParam = result.emailDelivered === false ? '&emailDelivered=0' : '';
    router.push(`/verify-email?email=${encodeURIComponent(email)}&purpose=email-verification${emailDeliveredParam}`);
  };

  return (
    <AuthCard title={t('createAccountTitle')} description={t('createAccountDescription')}>
      <form onSubmit={handleSubmit} className="stack">
        <div className="form-row">
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="firstName">{t('firstNameLabel')}</label>
            <input
              className="input"
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="lastName">{t('lastNameLabel')}</label>
            <input
              className="input"
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">{t('businessEmail')}</label>
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

        <PasswordField id="password" label={t('password')} value={password} onChange={setPassword} autoComplete="new-password" />
        <p className="field-hint">{t('passwordHint')}</p>

        <PasswordField
          id="confirmPassword"
          label={t('confirmPasswordLabel')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && <Banner variant="error">{error}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t('creatingAccount') : t('createAccount')}
        </button>

        <p className="text-secondary">
          {t('alreadyHaveAccount')} <Link href="/login">{t('signInLink')}</Link>
        </p>
      </form>
    </AuthCard>
  );
}
