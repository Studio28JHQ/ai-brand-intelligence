import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="app-header">
      <Link href="/" className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        AI Visibility Auditor
      </Link>
    </header>
  );
}
