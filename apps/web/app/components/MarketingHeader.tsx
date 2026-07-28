'use client';

import Link from 'next/link';
import { useTranslations } from '../../lib/i18n/client';

export function MarketingHeader() {
  const t = useTranslations('landing');
  const tNav = useTranslations('navigation');

  return (
    <header className="marketing-header">
      <Link href="/" className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        {t('brand')}
      </Link>

      <nav className="marketing-nav" aria-label={tNav('primaryNav')}>
        <a href="#product">{t('nav.product')}</a>
        <a href="#how-it-works">{t('nav.howItWorks')}</a>
        <a href="#platform">{t('nav.platform')}</a>
        <a href="#about">{t('nav.about')}</a>
        <Link href="/login">{t('nav.signIn')}</Link>
      </nav>

      <Link href="/onboarding" className="btn btn-primary btn-sm">
        {t('startFreeAudit')}
      </Link>
    </header>
  );
}
