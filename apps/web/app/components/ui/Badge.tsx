type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  // lifecycle "good" states
  completed: 'success',
  verified: 'success',
  active: 'primary',
  running: 'primary',
  ready: 'success',
  pass: 'success',
  resolved: 'success',
  high: 'danger',
  // lifecycle "in progress" / neutral states
  pending: 'warning',
  draft: 'neutral',
  planned: 'neutral',
  'in-progress': 'primary',
  verification: 'primary',
  medium: 'warning',
  low: 'neutral',
  none: 'neutral',
  // "attention" states
  warning: 'warning',
  'needs-improvement': 'warning',
  archived: 'neutral',
  fail: 'danger',
  failed: 'danger',
  cancelled: 'danger',
  'not-ready': 'danger',
  // trends
  improved: 'success',
  declined: 'danger',
  unchanged: 'neutral',
  unknown: 'neutral',
};

// "high"/"medium"/"low" mean "urgent/severe" for severity+priority (STATUS_VARIANTS above), but
// mean "how certain" for confidence — the same word, opposite polarity. Confidence badges must
// always pass this variant explicitly rather than relying on auto-detection.
export const CONFIDENCE_VARIANT: BadgeVariant = 'primary';

export function statusToVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status] ?? 'neutral';
}

export function Badge({ variant, children }: { variant?: BadgeVariant; children: string }) {
  const resolvedVariant = variant ?? statusToVariant(children);
  return <span className={`badge badge-${resolvedVariant}`}>{children}</span>;
}
