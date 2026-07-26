export interface AgencyProfile {
  name: string;
  website?: string;
}

const AGENCY_PROFILE_KEY = 'onboarding-agency-profile';
const COMPLETED_KEY = 'onboarding-completed';

// This platform has no accounts/authentication system (see docs/04_PROJECT/PRODUCTION_READINESS.md's
// "Rejected Scope"), so there is no backend concept to attach a real "Organization" record to.
// The agency profile is a browser-local convenience only — it personalizes the onboarding wizard's
// copy, nothing more, and is never sent to the API.
export function loadAgencyProfile(): AgencyProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(AGENCY_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AgencyProfile) : null;
  } catch {
    return null;
  }
}

export function saveAgencyProfile(profile: AgencyProfile): void {
  try {
    window.localStorage.setItem(AGENCY_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // private browsing / storage unavailable — onboarding still works, just won't remember the profile
  }
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingCompleted(): void {
  try {
    window.localStorage.setItem(COMPLETED_KEY, 'true');
  } catch {
    // ignore — worst case the success screen is shown again on a later visit
  }
}
