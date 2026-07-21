async function getBackendStatus(): Promise<string> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  try {
    const response = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
    const data = await response.json();
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
