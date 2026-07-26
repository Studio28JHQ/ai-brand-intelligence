export type UserStatus = 'pending-verification' | 'verified';
export type OtpPurpose = 'email-verification' | 'password-reset';

export interface UserMetadata {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

export interface RegisterResponse {
  email: string;
  /** The account is created either way — `false` only means the verification email itself could not be sent (e.g. no email provider configured). */
  emailDelivered: boolean;
}

export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
  user: UserMetadata;
}

export interface VerifyOtpResponse {
  verified: true;
  /** Only present when `purpose` was `password-reset` — the proof `/reset-password` needs. */
  resetToken?: string;
}

export interface AuthActionResponse {
  success: true;
  message: string;
  /** Only present when this action sends an email (resend-otp, forgot-password) — omitted where no email is involved (e.g. reset-password). */
  emailDelivered?: boolean;
}
