'use server';

import { cookies } from 'next/headers';
import { loadConfig } from '@ai-visibility/config';
import type { OtpPurpose, UserMetadata } from '@ai-visibility/contracts';

const SESSION_COOKIE = 'session';

interface ApiError {
  error?: { message?: string };
}

/**
 * Deliberately does not collapse every failure into one generic message — a caller (a developer
 * reading the server log, or a future error-reporting hook) needs to be able to tell "the API
 * process isn't reachable at all" apart from "the API responded but not with JSON" apart from
 * "the API rejected the request with a specific reason." Each branch logs the real underlying
 * error server-side (visible in the `apps/web` process's own log, e.g. `pnpm dev`'s terminal)
 * before returning a message that's still safe and useful to show the user. Fixed as part of
 * `F9-S02-HF01` — the previous single `catch { return 'Unable to reach the server' }` made every
 * one of these cases indistinguishable from the browser, including genuine validation failures
 * whose real message was being read successfully but then discarded.
 */
async function postJson<T>(path: string, body: unknown): Promise<{ data?: T; error?: string }> {
  const config = loadConfig();
  const url = `${config.API_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`[auth-actions] Could not reach the API at ${url}:`, error);
    return { error: 'Unable to reach the server. Please check your connection and try again.' };
  }

  let json: (T & ApiError) | undefined;
  try {
    json = (await response.json()) as T & ApiError;
  } catch (error) {
    console.error(`[auth-actions] API response from ${url} was not valid JSON (status ${response.status}):`, error);
    return { error: 'Received an unexpected response from the server. Please try again.' };
  }

  if (!response.ok) {
    const message = json?.error?.message;
    if (!message) {
      console.error(`[auth-actions] API error response from ${url} had no error message (status ${response.status}):`, json);
    }
    return { error: message ?? 'Something went wrong. Please try again.' };
  }

  return { data: json };
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ email?: string; emailDelivered?: boolean; error?: string }> {
  const result = await postJson<{ email: string; emailDelivered: boolean }>('/auth/register', input);
  return result.error
    ? { error: result.error }
    : { email: result.data!.email, emailDelivered: result.data!.emailDelivered };
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose,
): Promise<{ verified?: boolean; resetToken?: string; error?: string }> {
  const result = await postJson<{ verified: boolean; resetToken?: string }>('/auth/verify-otp', {
    email,
    code,
    purpose,
  });
  if (result.error) {
    return { error: result.error };
  }
  return { verified: result.data!.verified, resetToken: result.data!.resetToken };
}

export async function resendOtp(
  email: string,
  purpose: OtpPurpose,
): Promise<{ success?: boolean; emailDelivered?: boolean; error?: string }> {
  const result = await postJson<{ success: boolean; emailDelivered?: boolean }>('/auth/resend-otp', { email, purpose });
  return result.error ? { error: result.error } : { success: true, emailDelivered: result.data!.emailDelivered };
}

export async function forgotPassword(
  email: string,
): Promise<{ success?: boolean; emailDelivered?: boolean; error?: string }> {
  const result = await postJson<{ success: boolean; emailDelivered?: boolean }>('/auth/forgot-password', { email });
  return result.error ? { error: result.error } : { success: true, emailDelivered: result.data!.emailDelivered };
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
  confirmNewPassword: string,
): Promise<{ success?: boolean; error?: string }> {
  const result = await postJson<{ success: boolean }>('/auth/reset-password', {
    resetToken,
    newPassword,
    confirmNewPassword,
  });
  return result.error ? { error: result.error } : { success: true };
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Sets the session as an httpOnly cookie on the web app's own origin — the API never sets
 * cookies directly (it runs on a different origin in development), it only issues the signed
 * token in the JSON response; this action is the one place that turns it into a real session.
 */
export async function loginUser(input: LoginInput): Promise<{ success?: boolean; error?: string }> {
  const result = await postJson<{ token: string; expiresInSeconds: number; user: UserMetadata }>('/auth/login', input);

  if (result.error) {
    return { error: result.error };
  }

  const config = loadConfig();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, result.data!.token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: result.data!.expiresInSeconds,
    path: '/',
  });

  return { success: true };
}

export async function getCurrentUser(): Promise<UserMetadata | null> {
  const config = loadConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${config.API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as { user: UserMetadata | null };
    return json.user;
  } catch {
    return null;
  }
}
