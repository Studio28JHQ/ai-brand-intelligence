import { AuditContext } from './audit-context';
import { Engine } from './engine';
import { PipelineResults } from './pipeline-results';

export class ExecutionPipeline {
  constructor(private readonly engines: ReadonlyArray<Engine>) {}

  async run(context: AuditContext): Promise<PipelineResults> {
    const results: PipelineResults = {};

    for (const engine of this.engines) {
      results[engine.name] = await engine.run(context, results);
    }

    return results;
  }
}
