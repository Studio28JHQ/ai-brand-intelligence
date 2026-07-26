import Link from 'next/link';
import { Card, EmptyState, PageHeader } from './components/ui';

export default function NotFound() {
  return (
    <main className="page">
      <PageHeader title="Page not found" />
      <Card>
        <EmptyState
          title="We couldn't find that page"
          description="It may have been moved, or the link may be incorrect."
          action={
            <Link href="/" className="btn btn-primary">
              Back to Workspace
            </Link>
          }
        />
      </Card>
    </main>
  );
}
