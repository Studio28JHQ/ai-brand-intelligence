'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { PasswordField } from '../components/auth/PasswordField';
import { Banner } from '../components/ui';

export function RegisterForm() {
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
      setError('Password and confirmation do not match.');
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
    <AuthCard title="Create your account" description="Start auditing AI Visibility for your clients.">
      <form onSubmit={handleSubmit} className="stack">
        <div className="form-row">
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="firstName">First Name</label>
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
            <label htmlFor="lastName">Last Name</label>
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
          <label htmlFor="email">Business Email</label>
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

        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" />
        <p className="field-hint">At least 8 characters, with an uppercase letter, a lowercase letter, and a number.</p>

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && <Banner variant="error">{error}</Banner>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-secondary">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  );
}
