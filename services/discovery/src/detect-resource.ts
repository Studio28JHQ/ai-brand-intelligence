export async function detectResource(url: string): Promise<boolean> {
  try {
    const headResponse = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    if (headResponse.ok) {
      return true;
    }

    if (headResponse.status === 405) {
      const getResponse = await fetch(url, { method: 'GET', redirect: 'follow' });
      return getResponse.ok;
    }

    return false;
  } catch {
    return false;
  }
}
