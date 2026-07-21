export interface CrawlResult {
  finalUrl: string;
  httpStatus: number;
  headers: Record<string, string>;
  html: string;
  success: boolean;
}

export interface CrawlSummary {
  httpStatus: number;
  finalUrl: string;
  htmlSizeBytes: number;
  success: boolean;
}
