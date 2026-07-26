'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>{error.message || 'An unexpected error occurred.'}</p>
      <p>
        <button type="button" onClick={reset}>
          Try Again
        </button>
      </p>
      <p>
        <Link href="/">Back to Workspace</Link>
      </p>
    </main>
  );
}
