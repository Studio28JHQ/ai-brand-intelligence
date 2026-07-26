import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Link href="/" className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        AI Visibility Auditor
      </Link>

      <nav className="marketing-nav" aria-label="Primary">
        <a href="#product">Product</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#platform">Platform</a>
        <a href="#about">About</a>
        <Link href="/login">Sign In</Link>
      </nav>

      <Link href="/onboarding" className="btn btn-primary btn-sm">
        Start Free Audit
      </Link>
    </header>
  );
}
