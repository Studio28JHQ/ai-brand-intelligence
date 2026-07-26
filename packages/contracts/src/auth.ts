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
}
