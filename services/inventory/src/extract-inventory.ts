import type { InventoryResult } from '@ai-visibility/contracts';

function matchAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
  const match = tag.match(pattern);
  if (!match) {
    return null;
  }
  return decodeHtmlEntities(match[2] ?? match[3] ?? match[4] ?? '');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) {
    return null;
  }
  const title = decodeHtmlEntities(match[1].replace(/\s+/g, ' '));
  return title.length > 0 ? title : null;
}

function extractMetaTags(html: string): string[] {
  return html.match(/<meta\b[^>]*>/gi) ?? [];
}

function extractMetaDescription(metaTags: string[]): string | null {
  for (const tag of metaTags) {
    if (matchAttribute(tag, 'name')?.toLowerCase() === 'description') {
      const content = matchAttribute(tag, 'content');
      return content && content.length > 0 ? content : null;
    }
  }
  return null;
}

function extractCharset(metaTags: string[]): string | null {
  for (const tag of metaTags) {
    const charset = matchAttribute(tag, 'charset');
    if (charset) {
      return charset;
    }
  }
  for (const tag of metaTags) {
    if (matchAttribute(tag, 'http-equiv')?.toLowerCase() === 'content-type') {
      const content = matchAttribute(tag, 'content');
      const match = content?.match(/charset\s*=\s*([^\s;]+)/i);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

function extractCanonicalUrl(html: string): string | null {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of linkTags) {
    if (matchAttribute(tag, 'rel')?.toLowerCase() === 'canonical') {
      return matchAttribute(tag, 'href');
    }
  }
  return null;
}

function extractLanguage(html: string): string | null {
  const match = html.match(/<html\b[^>]*>/i);
  if (!match) {
    return null;
  }
  return matchAttribute(match[0], 'lang');
}

function extractH1Count(html: string): number {
  const matches = html.match(/<h1[\s>]/gi);
  return matches ? matches.length : 0;
}

function countLinks(html: string, pageUrl: string): { internal: number; external: number } {
  const anchorTags = html.match(/<a\b[^>]*>/gi) ?? [];
  let pageOrigin: string | null = null;
  try {
    pageOrigin = new URL(pageUrl).origin;
  } catch {
    pageOrigin = null;
  }

  let internal = 0;
  let external = 0;

  for (const tag of anchorTags) {
    const href = matchAttribute(tag, 'href');
    if (!href || href.startsWith('#')) {
      continue;
    }
    if (/^(mailto|tel|javascript):/i.test(href)) {
      continue;
    }

    try {
      const resolved = new URL(href, pageUrl);
      if (pageOrigin && resolved.origin === pageOrigin) {
        internal += 1;
      } else {
        external += 1;
      }
    } catch {
      continue;
    }
  }

  return { internal, external };
}

export function extractInventory(html: string, pageUrl: string): InventoryResult {
  const metaTags = extractMetaTags(html);
  const { internal, external } = countLinks(html, pageUrl);

  return {
    title: extractTitle(html),
    metaDescription: extractMetaDescription(metaTags),
    canonicalUrl: extractCanonicalUrl(html),
    language: extractLanguage(html),
    charset: extractCharset(metaTags),
    h1Count: extractH1Count(html),
    internalLinkCount: internal,
    externalLinkCount: external,
  };
}
