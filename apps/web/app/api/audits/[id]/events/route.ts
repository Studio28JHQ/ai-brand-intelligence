import { loadConfig } from '@ai-visibility/config';

// Proxies the API's real Server-Sent Events stream (GET /audits/:id/events, F10-S04B) through to
// the browser. The API base URL is server-only config (see actions.ts's other calls), so the
// browser can't open the EventSource directly against it — this route is a thin passthrough, not a
// second source of truth: every byte streamed here originates from the real API response.
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = loadConfig();

  const upstream = await fetch(`${config.API_URL}/audits/${id}/events`, {
    headers: { Accept: 'text/event-stream' },
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
