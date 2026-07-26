export function derivePrimaryDomain(url: string): string {
  return new URL(url).hostname;
}

export function deriveClientName(primaryDomain: string): string {
  return primaryDomain;
}
