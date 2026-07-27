import { Card, Skeleton, SkeletonBlock } from '../../components/ui';

export default function DashboardLoading() {
  return (
    <main className="page">
      <Skeleton width="160px" height="30px" />
      <div className="stack">
        <Card>
          <SkeletonBlock lines={3} />
        </Card>
        <Card>
          <SkeletonBlock lines={3} />
        </Card>
      </div>
    </main>
  );
}
