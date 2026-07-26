import type { ExecutiveDashboard } from '@ai-visibility/contracts';

export interface NextStep {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

/**
 * Derives the single highest-priority next action for a Project purely from data the
 * Dashboard already fetches — no new business logic, no new API calls. Each branch mirrors
 * one step of the Verification Workflow (docs/04_PROJECT/CURRENT_STATE.md).
 */
export function computeNextStep(dashboard: ExecutiveDashboard, projectId: string): NextStep {
  if (!dashboard.project.baselineAuditId) {
    return {
      title: 'Set a Baseline',
      description:
        "A Baseline is the reference Audit every future comparison and Impact Assessment measures against. Set one from the Workspace to unlock Optimization tracking for this Project.",
      ctaLabel: 'Go to Workspace',
      href: '/workspace',
    };
  }

  if (!dashboard.campaign) {
    return {
      title: 'Create an Optimization Campaign',
      description:
        'Turn your Optimization Plan into trackable work. A Campaign groups the highest-priority items into Actions you can advance one by one.',
      ctaLabel: 'Create Campaign',
      href: `/projects/${projectId}/campaign`,
    };
  }

  if (dashboard.campaign.status === 'draft') {
    return {
      title: 'Activate your Campaign',
      description: 'Your Campaign is still in draft. Activate it to start working through its Optimization Actions.',
      ctaLabel: 'Activate Campaign',
      href: `/projects/${projectId}/campaign`,
    };
  }

  if (dashboard.campaign.status === 'active' && dashboard.campaign.progressPercentage < 100) {
    const done = dashboard.campaign.completedActions + dashboard.campaign.verifiedActions;
    return {
      title: 'Work through your Optimization Actions',
      description: `${done} of ${dashboard.campaign.totalActions} Actions are done. Keep advancing them to move this Campaign toward completion.`,
      ctaLabel: 'Manage Campaign',
      href: `/projects/${projectId}/campaign`,
    };
  }

  if (dashboard.campaign.status === 'active' && dashboard.campaign.progressPercentage >= 100) {
    return {
      title: 'Mark your Campaign as Completed',
      description: 'Every Optimization Action has been worked. Advance the Campaign to Completed so its impact can be verified.',
      ctaLabel: 'Complete Campaign',
      href: `/projects/${projectId}/campaign`,
    };
  }

  if (dashboard.campaign.status === 'completed' && !dashboard.campaignImpact) {
    return {
      title: 'Run a Verification Audit',
      description: 'Run a new Audit against this Project to measure whether your completed Optimization work actually improved AI Visibility.',
      ctaLabel: 'Go to Workspace',
      href: '/workspace',
    };
  }

  if (dashboard.campaignImpact && dashboard.currentCycle && dashboard.currentCycle.status !== 'completed') {
    return {
      title: 'Review your Executive Client Report',
      description: "Impact has been measured. Review the Executive Client Report to see the full story, then advance the Optimization Cycle when you're ready to close it out.",
      ctaLabel: 'View Executive Client Report',
      href: `/projects/${projectId}/cycles/${dashboard.currentCycle.id}/report`,
    };
  }

  return {
    title: 'Start your next Optimization Cycle',
    description: 'This Optimization Cycle is complete. Run a new Audit to begin the next one.',
    ctaLabel: 'Go to Workspace',
    href: '/workspace',
  };
}
