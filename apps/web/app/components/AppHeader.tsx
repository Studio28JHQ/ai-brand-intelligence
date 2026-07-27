'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MarketingHeader } from './MarketingHeader';

const SHELL_PREFIXES = ['/workspace', '/clients', '/projects', '/audits', '/optimization', '/reports', '/settings'];

/**
 * The public marketing landing page (`/`) gets its own header (`MarketingHeader`); the authenticated
 * application shell (`/workspace` and everything under it, `F9-S03`) supplies 100% of its own chrome
 * via `AppShell` (`app/(shell)/layout.tsx`) — rendering this too would duplicate the header. Every
 * other route (auth pages: login/register/forgot-password/etc.) keeps the existing minimal brand bar.
 */
export function AppHeader() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <MarketingHeader />;
  }

  if (SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <header className="app-header">
      <Link href="/workspace" className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        AI Visibility Auditor
      </Link>
    </header>
  );
}
