'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { BriefingItem, UserMetadata } from '@ai-visibility/contracts';
import { logoutUser } from '../../auth-actions';
import { Badge } from '../ui';
import { BellIcon, ChevronDownIcon, LogOutIcon, MenuIcon, SearchIcon } from '../ui/icons';
import { useTranslations } from '../../../lib/i18n/client';

function initials(user: UserMetadata): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

/**
 * The "Workspace Selector" is honestly single-option, same reasoning as the Sidebar's Agency
 * Selector — there is exactly one Workspace in this deployment's data model today. Structured as a
 * real dropdown (not a static label) so adding a second Workspace later is additive, not a rewrite.
 */
function WorkspaceSelector() {
  const t = useTranslations('navigation');
  const [openState, setOpenState] = useState(false);
  const ref = useClickOutside(() => setOpenState(false));

  return (
    <div className="topbar__dropdown" ref={ref}>
      <button type="button" className="topbar__dropdown-trigger" onClick={() => setOpenState((value) => !value)} aria-haspopup="true" aria-expanded={openState}>
        {t('defaultWorkspace')}
        <ChevronDownIcon />
      </button>
      {openState && (
        <div className="topbar__dropdown-menu" role="menu">
          <span className="topbar__dropdown-item topbar__dropdown-item--active" role="menuitem" aria-current="true">
            {t('defaultWorkspace')}
          </span>
        </div>
      )}
    </div>
  );
}

function Search() {
  const t = useTranslations('navigation');
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      className="topbar__search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (query.trim()) {
          router.push(`/clients?q=${encodeURIComponent(query.trim())}`);
        }
      }}
    >
      <SearchIcon />
      <label htmlFor="topbar-search" className="visually-hidden">
        {t('searchClients')}
      </label>
      <input
        id="topbar-search"
        type="search"
        placeholder={t('searchClientsPlaceholder')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}

function Notifications({ items }: { items: BriefingItem[] }) {
  const t = useTranslations('navigation');
  const [openState, setOpenState] = useState(false);
  const ref = useClickOutside(() => setOpenState(false));
  const highPriority = items.filter((item) => item.confidence === 'high');

  return (
    <div className="topbar__dropdown" ref={ref}>
      <button
        type="button"
        className="topbar__icon-button"
        onClick={() => setOpenState((value) => !value)}
        aria-haspopup="true"
        aria-expanded={openState}
        aria-label={
          highPriority.length > 0
            ? t('notificationsNeedingAttention', { count: highPriority.length })
            : t('notificationsLabel')
        }
      >
        <BellIcon />
        {highPriority.length > 0 && <span className="topbar__badge">{highPriority.length}</span>}
      </button>
      {openState && (
        <div className="topbar__dropdown-menu topbar__dropdown-menu--wide" role="menu">
          {items.length === 0 && <p className="topbar__dropdown-empty">{t('nothingNeedsAttention')}</p>}
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.projectId}/dashboard`}
              className="topbar__notification"
              role="menuitem"
              onClick={() => setOpenState(false)}
            >
              <span className="topbar__notification-title">{item.title}</span>
              <span className="topbar__notification-meta">{item.clientName}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ user }: { user: UserMetadata }) {
  const t = useTranslations('navigation');
  const router = useRouter();
  const [openState, setOpenState] = useState(false);
  const ref = useClickOutside(() => setOpenState(false));

  return (
    <div className="topbar__dropdown" ref={ref}>
      <button
        type="button"
        className="topbar__user-trigger"
        onClick={() => setOpenState((value) => !value)}
        aria-haspopup="true"
        aria-expanded={openState}
      >
        <span className="topbar__avatar" aria-hidden="true">
          {initials(user)}
        </span>
        <span className="topbar__user-name">{user.firstName}</span>
        <ChevronDownIcon />
      </button>
      {openState && (
        <div className="topbar__dropdown-menu" role="menu">
          <div className="topbar__dropdown-header">
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span className="text-secondary">{user.email}</span>
          </div>
          <Link href="/settings" className="topbar__dropdown-item" role="menuitem" onClick={() => setOpenState(false)}>
            {t('myProfile')}
          </Link>
          <Link href="/settings" className="topbar__dropdown-item" role="menuitem" onClick={() => setOpenState(false)}>
            {t('workspaceSettings')}
          </Link>
          <Link href="/settings" className="topbar__dropdown-item" role="menuitem" onClick={() => setOpenState(false)}>
            {t('accountSettings')}
          </Link>
          <button
            type="button"
            className="topbar__dropdown-item topbar__dropdown-item--button"
            role="menuitem"
            onClick={async () => {
              setOpenState(false);
              await logoutUser();
              router.push('/login');
              router.refresh();
            }}
          >
            <LogOutIcon />
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar({
  user,
  notifications,
  onToggleSidebar,
}: {
  user: UserMetadata;
  notifications: BriefingItem[];
  onToggleSidebar: () => void;
}) {
  const t = useTranslations('navigation');

  return (
    <header className="topbar">
      <button type="button" className="topbar__menu-button" onClick={onToggleSidebar} aria-label={t('toggleNavigation')}>
        <MenuIcon />
      </button>
      <WorkspaceSelector />
      <div className="topbar__spacer" />
      <Search />
      <Notifications items={notifications} />
      <UserMenu user={user} />
      {user.status !== 'verified' && <Badge variant="warning">{t('unverified')}</Badge>}
    </header>
  );
}
