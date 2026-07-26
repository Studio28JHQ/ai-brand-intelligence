import type { ReactNode } from 'react';
import { InboxIcon } from './icons';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state" role="status">
      <span className="text-tertiary">
        <InboxIcon />
      </span>
      <p className="empty-state__title">
        <strong>{title}</strong>
      </p>
      {description && <p className="text-secondary">{description}</p>}
      {action}
    </div>
  );
}
