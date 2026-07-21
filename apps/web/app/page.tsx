import { loadConfig } from '@ai-visibility/config';
import type { HealthResponse } from '@ai-visibility/contracts';

async function getBackendStatus(): Promise<string> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/health`, { cache: 'no-store' });
    const data: HealthResponse = await response.json();
    return data.status;
  } catch {
    return 'unreachable';
  }
}

export default async function Home() {
  const status = await getBackendStatus();

  return (
    <main>
      <h1>Backend Status</h1>
      <p>Status: {status}</p>
    </main>
  );
}
