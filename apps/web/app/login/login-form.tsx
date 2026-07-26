'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser, resendOtp } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner } from '../components/ui';

const UNVERIFIED_MESSAGE = 'Please verify your email before signing in.';

export function LoginForm() {
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
  const isUnverifiedError = error === UNVERIFIED_MESSAGE;

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
    <AuthCard title="Sign In" description="Sign in to your AI Visibility Auditor workspace.">
      <form onSubmit={handleSubmit} className="stack">
        {justVerified && <Banner variant="success">Your email is verified. You can sign in now.</Banner>}
        {justReset && <Banner variant="success">Your password has been reset. Sign in with your new password.</Banner>}

        <div className="field">
          <label htmlFor="email">Email</label>
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

        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />

        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <label className="cluster" style={{ gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-secondary">
            Forgot password?
          </Link>
        </div>

        {error && (
          <Banner variant="error">
            {error}
            {isUnverifiedError && (
              <>
                {' '}
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend}>
                  Resend verification code
                </button>
              </>
            )}
          </Banner>
        )}
        {resent && <Banner variant="success">Verification code resent. Check your email.</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-secondary">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </p>
      </form>
    </AuthCard>
  );
}
