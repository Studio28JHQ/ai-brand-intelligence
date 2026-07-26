import type { ReactNode } from 'react';
import { AlertCircleIcon, CheckCircleIcon, InfoCircleIcon } from './icons';

type BannerVariant = 'success' | 'error' | 'info';

const ICONS: Record<BannerVariant, ReactNode> = {
  success: <CheckCircleIcon />,
  error: <AlertCircleIcon />,
  info: <InfoCircleIcon />,
};

export function Banner({ variant, children }: { variant: BannerVariant; children: ReactNode }) {
  return (
    <div className={`banner banner-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{ICONS[variant]}</span>
      <span>{children}</span>
    </div>
  );
}
