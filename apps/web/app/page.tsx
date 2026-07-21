'use client';

import { useActionState } from 'react';
import { createAudit, CreateAuditState } from './actions';

const initialState: CreateAuditState = {};

export default function Home() {
  const [state, formAction, pending] = useActionState(createAudit, initialState);

  return (
    <main>
      <form action={formAction}>
        <input type="url" name="url" placeholder="https://example.com" required />
        <button type="submit" disabled={pending}>
          Analyze
        </button>
      </form>

      {state.result && (
        <div>
          <h1>Audit Created</h1>
          <p>Audit ID: {state.result.id}</p>
          <p>Current Status: {state.result.status}</p>
          {state.result.discovery && (
            <>
              <p>Normalized URL: {state.result.discovery.normalizedUrl}</p>
              <p>robots.txt detected: {state.result.discovery.robotsTxtDetected ? 'Yes' : 'No'}</p>
              <p>sitemap.xml detected: {state.result.discovery.sitemapDetected ? 'Yes' : 'No'}</p>
            </>
          )}
          {state.result.crawl && (
            <>
              <p>HTTP Status: {state.result.crawl.httpStatus}</p>
              <p>Final URL: {state.result.crawl.finalUrl}</p>
              <p>HTML Size: {state.result.crawl.htmlSizeBytes} bytes</p>
              <p>Crawl Success: {state.result.crawl.success ? 'Yes' : 'No'}</p>
            </>
          )}
        </div>
      )}

      {state.error && <p>{state.error}</p>}
    </main>
  );
}
