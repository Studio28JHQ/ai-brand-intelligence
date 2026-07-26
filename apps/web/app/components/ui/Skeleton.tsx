export function Skeleton({ width = '100%', height = '14px' }: { width?: string; height?: string }) {
  return <span className="skeleton" style={{ width, height }} aria-hidden="true" />;
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="stack-sm" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '60%' : '100%'} />
      ))}
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
