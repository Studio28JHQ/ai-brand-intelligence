import type { ReactNode } from 'react';

export function AuthCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__heading">
          <h1>{title}</h1>
          {description && <p className="text-secondary">{description}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
