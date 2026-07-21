export const DISCOVERY_PORT = Symbol('DISCOVERY_PORT');

export interface DiscoveryResult {
  normalizedUrl: string;
  robotsTxtUrl: string;
  robotsTxtDetected: boolean;
  sitemapUrl: string;
  sitemapDetected: boolean;
}

export interface DiscoveryPort {
  discover(auditId: string, url: string): Promise<DiscoveryResult>;
}
