import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, EmptyState, PageHeader } from '../components/ui';

export const metadata: Metadata = {
  title: 'Sign In — AI Visibility Auditor',
  description: 'Sign in to AI Visibility Auditor.',
};

export default function LoginPage() {
  return (
    <main className="page">
      <PageHeader title="Sign In" />
      <Card>
        <EmptyState
          title="Authentication is coming in the next sprint."
          description="There is nothing to sign in with yet — every Workspace is open today. Check back soon."
          action={
            <Link href="/" className="btn btn-primary btn-sm">
              Back to Home
            </Link>
          }
        />
      </Card>
    </main>
  );
}
