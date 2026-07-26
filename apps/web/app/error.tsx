'use client';

import Link from 'next/link';
import { Banner, Card, PageHeader } from './components/ui';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page">
      <PageHeader title="Something went wrong" />
      <Card>
        <Banner variant="error">{error.message || 'An unexpected error occurred.'}</Banner>
        <div className="cluster">
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to Workspace
          </Link>
        </div>
      </Card>
    </main>
  );
}
