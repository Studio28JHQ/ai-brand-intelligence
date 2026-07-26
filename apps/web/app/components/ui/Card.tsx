import type { ReactNode } from 'react';

export function Card({
  title,
  actions,
  muted,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={muted ? 'card card--muted' : 'card'}>
      {title && (
        <div className="card__header">
          <h2>{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
