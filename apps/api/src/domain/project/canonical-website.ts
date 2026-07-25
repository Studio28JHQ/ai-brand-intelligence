export function deriveCanonicalWebsite(url: string): string {
  return new URL(url).origin;
}

export function deriveProjectName(canonicalWebsite: string): string {
  return new URL(canonicalWebsite).hostname;
}
