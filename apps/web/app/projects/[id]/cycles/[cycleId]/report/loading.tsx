import { Card, Skeleton, SkeletonBlock } from '../../../../../components/ui';

export default function ExecutiveClientReportLoading() {
  return (
    <main className="page">
      <Skeleton width="260px" height="14px" />
      <Skeleton width="360px" height="30px" />
      <div className="stack">
        <Card>
          <SkeletonBlock lines={2} />
        </Card>
        <Card>
          <SkeletonBlock lines={5} />
        </Card>
        <Card>
          <SkeletonBlock lines={5} />
        </Card>
      </div>
    </main>
  );
}
