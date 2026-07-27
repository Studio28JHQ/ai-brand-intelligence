import { redirect } from 'next/navigation';
import { getCurrentUser } from '../auth-actions';
import { getDailyBriefing } from '../actions';
import { AppShell } from '../components/shell/AppShell';

/**
 * Everything under this route group (`/workspace`, `/clients`, `/projects/*`, `/audits/*`,
 * `/optimization`, `/reports`, `/settings`) is the "authenticated application shell" (`F9-S03`) —
 * gated behind a real session for the first time (`docs/04_PROJECT/AUTHENTICATION.md`'s prior
 * "Rejected Scope: Gating existing routes behind login" is superseded by this ticket, see
 * `docs/04_PROJECT/DECISION_LOG.md#cto-093`). `AppHeader` (root layout) renders nothing for these
 * routes — this layout supplies 100% of the chrome via `AppShell`.
 */
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const briefing = await getDailyBriefing();

  return (
    <AppShell user={user} notifications={briefing?.items ?? []}>
      {children}
    </AppShell>
  );
}
