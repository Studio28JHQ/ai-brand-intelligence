'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner, EmptyState } from '../components/ui';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Reset your password">
        <EmptyState
          title="This link is invalid or has expired"
          description="Request a new password reset code and try again."
          action={
            <a href="/forgot-password" className="btn btn-primary btn-sm">
              Request New Code
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
      setError('Password and confirmation do not match.');
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
    <AuthCard title="Set a new password">
      <form onSubmit={handleSubmit} className="stack">
        <PasswordField
          id="newPassword"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <p className="field-hint">At least 8 characters, with an uppercase letter, a lowercase letter, and a number.</p>

        <PasswordField
          id="confirmNewPassword"
          label="Confirm New Password"
          value={confirmNewPassword}
          onChange={setConfirmNewPassword}
          autoComplete="new-password"
        />

        {error && <Banner variant="error">{error}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </AuthCard>
  );
}
