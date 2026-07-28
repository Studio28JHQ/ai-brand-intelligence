'use client';

import Link from 'next/link';
import { ChevronRightIcon } from './icons';
import { useTranslations } from '../../../lib/i18n/client';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const tCommon = useTranslations('common');

  return (
    <nav className="breadcrumbs" aria-label={tCommon('breadcrumbAriaLabel')}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="cluster">
            {index > 0 && (
              <span className="breadcrumbs__separator" aria-hidden="true">
                <ChevronRightIcon />
              </span>
            )}
            {item.href && !isLast ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className={isLast ? 'breadcrumbs__current' : undefined} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
