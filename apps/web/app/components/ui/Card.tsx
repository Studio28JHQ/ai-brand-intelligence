import type { ReactNode } from 'react';

export function Card({
  title,
  description,
  actions,
  muted,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={muted ? 'card card--muted' : 'card'}>
      {title && (
        <div className="card__header">
          <div>
            <h2>{title}</h2>
            {description && <p className="text-secondary">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
