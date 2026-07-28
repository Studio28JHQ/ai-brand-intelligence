'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/workspace', icon: DashboardIcon },
  { label: 'Activity', href: '/activity', icon: ActivityIcon },
  { label: 'Clients', href: '/clients', icon: ClientsIcon },
  { label: 'Projects', href: '/projects', icon: ProjectsIcon },
  { label: 'Audits', href: '/audits', icon: AuditsIcon },
  { label: 'Optimization', href: '/optimization', icon: OptimizationIcon },
  { label: 'Reports', href: '/reports', icon: ReportsIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

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

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__agency">
        <span className="app-header__mark" aria-hidden="true">
          AI
        </span>
        <div className="sidebar__agency-text">
          <span className="sidebar__agency-name">AI Visibility Auditor</span>
          <span className="sidebar__agency-label">Agency</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
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
