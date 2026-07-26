'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { OtpPurpose } from '@ai-visibility/contracts';
import { resendOtp, verifyOtp } from '../auth-actions';
import { AuthCard } from '../components/auth/AuthCard';
import { OtpInput } from '../components/auth/OtpInput';
import { Banner } from '../components/ui';
import { CheckCircleIcon } from '../components/ui/icons';

const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const purpose = (searchParams.get('purpose') as OtpPurpose | null) ?? 'email-verification';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [verifying, setVerifying] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendMessage, setResendMessage] = useState<string | undefined>(undefined);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.length !== 6 || verifying || succeeded) {
      return;
    }
    setVerifying(true);
    setError(undefined);

    const result = await verifyOtp(email, code, purpose);
    setVerifying(false);

    if (result.error) {
      setError(result.error);
      hasAutoSubmitted.current = false;
      return;
    }

    setSucceeded(true);
    setTimeout(() => {
      if (purpose === 'email-verification') {
        router.push('/login?verified=1');
      } else {
        router.push(`/reset-password?token=${encodeURIComponent(result.resetToken ?? '')}`);
      }
    }, 1200);
  };

  useEffect(() => {
    if (code.length === 6 && !hasAutoSubmitted.current && !succeeded) {
      hasAutoSubmitted.current = true;
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    setResendMessage(undefined);
    setError(undefined);
    const result = await resendOtp(email, purpose);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResendMessage('A new code has been sent.');
  };

  const changeEmailHref = purpose === 'email-verification' ? '/register' : '/forgot-password';

  if (succeeded) {
    return (
      <AuthCard title="Verified">
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="text-secondary" style={{ color: 'var(--color-success)' }}>
            <CheckCircleIcon />
          </span>
          <p>
            {purpose === 'email-verification'
              ? 'Your email is verified. Redirecting to sign in…'
              : 'Code verified. Redirecting…'}
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Enter your verification code" description={email ? `We sent a 6-digit code to ${email}.` : undefined}>
      <div className="stack">
        <OtpInput value={code} onChange={setCode} disabled={verifying} />

        {error && <Banner variant="error">{error}</Banner>}
        {resendMessage && <Banner variant="success">{resendMessage}</Banner>}

        <button type="button" className="btn btn-primary" disabled={code.length !== 6 || verifying} onClick={handleVerify}>
          {verifying ? 'Verifying…' : 'Verify Code'}
        </button>

        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={cooldown > 0}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend code in ${formatCountdown(cooldown)}` : 'Resend code'}
          </button>
          <Link href={changeEmailHref} className="text-secondary">
            Change email
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
