import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecuteAuditUseCase {
  // Placeholder seam for future engines (crawling, discovery, etc.); intentionally a no-op for now.
  async execute(_auditId: string): Promise<void> {}
}
