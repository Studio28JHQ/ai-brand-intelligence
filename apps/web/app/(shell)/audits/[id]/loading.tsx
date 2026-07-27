import { Card, Skeleton, SkeletonBlock } from '../../../components/ui';

export default function AuditDetailLoading() {
  return (
    <main className="page">
      <Skeleton width="180px" height="14px" />
      <Skeleton width="260px" height="30px" />
      <div className="stack">
        <Card>
          <SkeletonBlock lines={4} />
        </Card>
        <Card>
          <SkeletonBlock lines={3} />
        </Card>
      </div>
    </main>
  );
}
