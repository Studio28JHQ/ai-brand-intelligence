export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function matchAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
  const match = tag.match(pattern);
  if (!match) {
    return null;
  }
  return decodeHtmlEntities(match[2] ?? match[3] ?? match[4] ?? '');
}

export function hasAttribute(tag: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`, 'i').test(tag);
}

export function matchTags(html: string, tagName: string): string[] {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

export function matchTagsWithContent(html: string, tagName: string): Array<{ tag: string; content: string }> {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)</${tagName}>`, 'gi');
  const results: Array<{ tag: string; content: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    results.push({ tag: `<${tagName}${match[1]}>`, content: match[2] });
  }
  return results;
}

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

export function countWords(text: string): number {
  const decoded = decodeHtmlEntities(stripTags(text));
  const words = decoded.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}
