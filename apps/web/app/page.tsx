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
        </div>
      )}

      {state.error && <p>{state.error}</p>}
    </main>
  );
}
