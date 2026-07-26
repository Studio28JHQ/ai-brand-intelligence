# Purpose

To record the authentication system delivered at `F9-S02` (see `docs/04_PROJECT/DECISION_LOG.md#cto-084`) — the domain model, the registration/verification/login/reset flows, the OTP lifecycle, account states, and what was deliberately kept out of scope. This is a reference document, not a standard with its own approval process.

# Domain Model

Identity is a deliberately separate bounded context from every business module (`Client`/`Project`/`Audit`/...) — no foreign key exists in either direction, and no business module or use case reads or depends on anything in `apps/api/src/{domain,application,infrastructure,presentation}/{auth,user,otp}`. This is not incidental: it is what "Keep authentication isolated behind the existing architecture. Do not couple business modules to authentication" required.

**`User`** (`apps/api/src/domain/user/`) — `id`, `firstName`, `lastName`, `email` (unique), `passwordHash` (never plain text, `bcryptjs`, 12 salt rounds), `status`, `createdAt`, `verifiedAt`. Immutable, private-constructor + `fromPersistence`, matching every other aggregate in this codebase (`OptimizationCycle`, `OptimizationPattern`, ...).

**`OtpCode`** (`apps/api/src/domain/otp/`) — `id`, `userId`, `purpose` (`email-verification` | `password-reset`), `codeHash` (SHA-256, never the raw 6-digit code), `expiresAt`, `consumedAt`, `createdAt`. One table serves both purposes, distinguished by `purpose`, so a code issued for one can never be replayed for the other.

# Account States

```
pending-verification ──(OTP verified)──> verified
```

A brand-new account starts `pending-verification` and can only ever become `verified` — there is no path back, matching this codebase's established discipline of encoding lifecycle as an explicit, one-directional `VALID_TRANSITIONS` table (`OptimizationCycle`, `CTO-071`; `OptimizationPattern`, `CTO-082`) rather than a loose status string.

# OTP Lifecycle

```
issued ──(correct code, before expiry)──> consumed (terminal)
   │
   └──(wrong code / expired / already consumed)──> rejected, code stays as it was
```

- **Issued**: `IssueOtpUseCase` generates a random 6-digit code (`node:crypto`'s `randomInt`), hashes it (SHA-256 — fast by design, since OTPs are short-lived, single-use, and already rate-limited, unlike passwords which use `bcrypt`'s deliberately slow cost function), persists it with an `expiresAt` (`OTP_EXPIRATION_MINUTES`, default 10), and emails it via the `EmailSender` port.
- **Superseded, not retroactively invalidated**: issuing a new code (via resend, or a fresh forgot-password request) does not touch any earlier code row — `findLatestByUserAndPurpose` simply never looks at anything but the newest one, so older codes become unreachable rather than explicitly cancelled.
- **Single-use**: `consume()` sets `consumedAt`; `assertUsable()` throws `OtpCodeAlreadyConsumedError` on any later attempt to reuse it.
- **Expiration checked at verification time**, not swept by a background job — this platform has no job scheduler (`CTO-082`'s "no automation" precedent), so `isExpired(now)` is evaluated live against `expiresAt` whenever a code is checked.

# Authentication Flow

```
/register ──> POST /auth/register ──> /verify-email?purpose=email-verification ──> /login
/forgot-password ──> POST /auth/forgot-password ──> /verification-sent ──> /verify-email?purpose=password-reset ──> /reset-password ──> /login
```

**Registration** (`RegisterUserUseCase`): validates password confirmation, checks email uniqueness (`UserAlreadyExistsError` — see "Email existence disclosure" below), hashes the password, creates the `User` in `pending-verification`, and issues an `email-verification` OTP.

**Email verification / password-reset OTP entry share one screen** (`/verify-email`, `VerifyOtpUseCase`) distinguished by a `purpose` query param — the ticket's own EMAIL VERIFICATION section (auto-focus, paste support, countdown, resend, change email, success confirmation) is generic to "enter a 6-digit code," so one component (`OtpInput`, `apps/web/app/components/auth/`) and one page serves both. On success: `email-verification` marks the `User` verified and redirects to `/login`; `password-reset` does **not** mark anything (there's nothing to mark) — instead it consumes the OTP and returns a short-lived (`10 min`) signed `resetToken`, which `/reset-password` presents back to `POST /auth/reset-password` to actually change the password. This means the OTP is never re-entered or re-checked a second time — verifying it once is proof enough.

**Login** (`LoginUseCase`): resolves the user, verifies the password, then checks verification status last — a wrong password against an unverified account still yields the generic "Invalid email or password," never the verification-specific message, so password-guessing can't be used to probe verification status. `rememberMe` selects between a short session (`JWT_SESSION_EXPIRATION_MINUTES`, default 60 min) and a long one (`JWT_REMEMBER_ME_EXPIRATION_DAYS`, default 30 days).

**Forgot/reset password**: `ForgotPasswordUseCase` always resolves the same way whether or not the email exists (see below); `ResetPasswordUseCase` verifies the `resetToken`'s signature and `purpose` claim, then updates the password hash directly — the OTP itself was already consumed at the verify-email step.

# Session Model

Sessions are self-contained signed JWTs (`SessionTokenService`, `jsonwebtoken`), not a persisted session table — chosen to avoid a new stateful store this platform doesn't otherwise need. `apps/web` never verifies the token itself; `auth-actions.ts`'s `loginUser` receives it from `POST /auth/login` and sets it as an **httpOnly** cookie on the web app's own origin (verified live: `document.cookie` returns empty on an authenticated page — the cookie is genuinely inaccessible to JavaScript). Every subsequent read (`getCurrentUser()`) forwards the cookie value to `GET /auth/me` as a Bearer token; the API is the only place that ever holds `JWT_SECRET` or verifies a token's signature — session logic never leaves the isolated auth module.

# Security

- **Passwords**: `bcryptjs`, 12 salt rounds, never logged, never returned in any API response (`UserMetadata` excludes `passwordHash` at the mapper level, not by convention).
- **Email existence disclosure**: `LoginUseCase` and `ForgotPasswordUseCase` never distinguish "no such account" from "wrong password" / "no OTP sent" — both return one identical response. `ResendOtpUseCase` for `purpose: 'password-reset'` preserves this too (silent no-op for an unknown email, since it sits behind forgot-password); `purpose: 'email-verification'` resend is the one place existence is knowingly revealed, and only because that email was just entered by the same user one step earlier at `/register` — there is nothing left to protect.
- **Rate limiting**: `@Throttle()` overrides on every endpoint the ticket names — register (3/min), login (5/min), verify-otp (10/min, more lenient since legitimate typos happen), resend-otp (3/min), forgot-password (3/min), reset-password (5/min) — layered on top of the global 120/min default (`CTO-080`).
- **Password strength**: minimum 8 characters, at least one uppercase, one lowercase, one digit (`class-validator` `@Matches`, both `RegisterDto` and `ResetPasswordDto`).

# Provider Extensibility

Two ports exist specifically so this module can grow without being rewritten:

- **`EmailSender`** (`application/notifications/email-sender.ts`) — no SMTP/transactional-email provider is configured anywhere in this environment, so `ConsoleEmailSender` (bound by default) writes the message to the structured log instead. A real provider (SendGrid, SES, SMTP) is a DI rebind of `EMAIL_SENDER`, never a change to any use case — the same Null-Object-to-real-provider pattern already proven for `AI_PROVIDER` (`CTO-068`/`CTO-069`).
- **Future identity providers** (Google, Microsoft, GitHub, SAML — explicitly named in the ticket's TECHNICAL section): today's `LoginUseCase`/`RegisterUserUseCase` are the only entry points that construct a session; a future OAuth/SAML provider would add a new use case that resolves-or-creates a `User` and calls the same `SessionTokenService.issueSessionToken`, without touching `User`, `OtpCode`, or any existing use case. No provider abstraction was pre-built for this (there is nothing to abstract yet with zero real providers), but nothing in the current design assumes email/password is the only way to reach a session.

# Rejected Scope

- **Gating existing routes behind login.** The ticket's own TECHNICAL section ("Do not couple business modules to authentication") and "Existing functionality preserved" both argue against retrofitting an auth check onto `/workspace`, `/projects/*`, or any API endpoint — every one of those remains exactly as open as before this sprint. Authentication now *exists*; nothing yet *requires* it.
- **A persisted session/refresh-token table.** A stateless JWT was judged sufficient for what "Authentication session implemented" asks for; revocable server-side sessions are a legitimate future upgrade, not required here.
- **A `/logout` route.** Not in the ticket's ROUTES list or ACCEPTANCE CRITERIA; sessions simply expire via JWT `exp`. Adding one would also mean touching `AppHeader` to show signed-in state, itself unrequested.
- **Showing signed-in state in `AppHeader`.** `GET /auth/me` exists and was verified working, but no page reads it — wiring it into the header is a presentational change beyond this ticket's explicit scope.
- **A real transactional email provider.** No SMTP/API credentials exist in this environment; see "Provider Extensibility" above.
