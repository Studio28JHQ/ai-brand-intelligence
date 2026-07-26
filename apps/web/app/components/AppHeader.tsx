'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MarketingHeader } from './MarketingHeader';

/** The public marketing landing page (`/`) gets its own header (`MarketingHeader`); every internal app route keeps the existing minimal brand bar, now pointing back to the Workspace rather than the public site. */
export function AppHeader() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <MarketingHeader />;
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
