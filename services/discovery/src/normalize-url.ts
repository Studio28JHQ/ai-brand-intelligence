export function normalizeUrl(raw: string): string {
  const parsed = new URL(raw);

  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = '';

  const isDefaultPort =
    (parsed.protocol === 'http:' && parsed.port === '80') ||
    (parsed.protocol === 'https:' && parsed.port === '443');

  if (isDefaultPort) {
    parsed.port = '';
  }

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return parsed.toString();
}
