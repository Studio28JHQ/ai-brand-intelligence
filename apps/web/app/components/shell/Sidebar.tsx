'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '../../../lib/i18n/client';
import {
  ActivityIcon,
  AuditsIcon,
  ClientsIcon,
  DashboardIcon,
  OptimizationIcon,
  ProjectsIcon,
  ReportsIcon,
  SettingsIcon,
} from '../ui/icons';

function isActive(pathname: string, href: string): boolean {
  return href === '/workspace' ? pathname === '/workspace' : pathname.startsWith(href);
}

/**
 * The "Agency Selector" the ticket asks for lives here, at the top of the Sidebar — rendered
 * honestly as a single, non-fabricated agency (this platform has no multi-agency data model; every
 * `Client`/`Project`/`User` in this deployment belongs to one implicit agency), not a fake dropdown
 * pretending switchable agencies exist (`F9-S03`, see `docs/04_PROJECT/DECISION_LOG.md#cto-093`).
 */
export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const NAV_ITEMS = [
    { label: t('dashboard'), href: '/workspace', icon: DashboardIcon },
    { label: t('activity'), href: '/activity', icon: ActivityIcon },
    { label: t('clients'), href: '/clients', icon: ClientsIcon },
    { label: t('projects'), href: '/projects', icon: ProjectsIcon },
    { label: t('audits'), href: '/audits', icon: AuditsIcon },
    { label: t('optimization'), href: '/optimization', icon: OptimizationIcon },
    { label: t('reports'), href: '/reports', icon: ReportsIcon },
    { label: t('settings'), href: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__agency">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        <div className="sidebar__agency-text">
          <span className="sidebar__agency-name">AI Visibility Auditor</span>
          <span className="sidebar__agency-label">{t('agencyLabel')}</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label={t('primaryNav')}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
