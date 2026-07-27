'use client';

import { useState } from 'react';
import type { BriefingItem, UserMetadata } from '@ai-visibility/contracts';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({
  user,
  notifications,
  children,
}: {
  user: UserMetadata;
  notifications: BriefingItem[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell-layout">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar__scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <div className="app-shell-layout__content">
        <TopBar user={user} notifications={notifications} onToggleSidebar={() => setSidebarOpen((value) => !value)} />
        <div className="app-shell-layout__body">{children}</div>
      </div>
    </div>
  );
}
