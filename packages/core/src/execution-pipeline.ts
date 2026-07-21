import { AuditContext } from './audit-context';
import { Engine } from './engine';

export type PipelineResults = Record<string, unknown>;

export class ExecutionPipeline {
  constructor(private readonly engines: ReadonlyArray<Engine>) {}

  async run(context: AuditContext): Promise<PipelineResults> {
    const results: PipelineResults = {};

    for (const engine of this.engines) {
      results[engine.name] = await engine.run(context);
    }

    return results;
  }
}
