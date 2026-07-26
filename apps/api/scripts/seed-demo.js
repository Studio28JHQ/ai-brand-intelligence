/**
 * Seeds a demo agency workspace for pilot demonstrations: a Demo Client, Demo Project,
 * a full Optimization Cycle (Baseline Audit -> Findings -> Optimization Plan -> Campaign
 * -> completed Actions -> Verification Audit -> Impact Assessment), so the AI Daily
 * Briefing, AI Consultant Chat, and Executive Client Report all have real content to show.
 *
 * Drives the same HTTP API a real agency would use. The one thing no endpoint can do —
 * make a real crawl of a real site "fail" a content rule — is done by flipping two of the
 * three already-inserted Finding rows for the initial Audit to severity 'warning' directly
 * via Prisma, exactly like the synthetic-data testing used throughout this project's build.
 *
 * Usage: node apps/api/scripts/seed-demo.js
 * Requires: the API running (API_URL, default http://localhost:3001) and the database
 * reachable (DATABASE_URL). Safe to re-run — reuses the Demo Client/Project if they already
 * exist, but always creates a fresh Audit/Optimization Cycle (each run represents a new pilot pass).
 */

const { loadConfig } = require('@ai-visibility/config');
const { getPrismaClient, disconnectDatabase } = require('@ai-visibility/database');

const config = loadConfig();
const API_URL = config.API_URL;

const DEMO_CLIENT = { name: 'Acme Digital (Demo)', industry: 'retail', primaryDomain: 'example.com' };
const DEMO_URL = 'https://example.com';
const SYNTHETIC_FAIL_RULE_IDS = ['discovery-execution', 'inventory-execution'];

async function api(method, path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
  }
  return response.json();
}

async function findOrCreateDemoClient() {
  const clients = await api('GET', '/clients');
  const existing = clients.find((client) => client.primaryDomain === DEMO_CLIENT.primaryDomain);
  if (existing) {
    console.log(`Reusing existing Demo Client: ${existing.id}`);
    return existing;
  }
  await api('POST', '/clients', DEMO_CLIENT);
  const refreshed = await api('GET', '/clients');
  const created = refreshed.find((client) => client.primaryDomain === DEMO_CLIENT.primaryDomain);
  console.log(`Created Demo Client: ${created.id}`);
  return created;
}

async function seedActionableFindings(auditId, prisma) {
  for (const ruleId of SYNTHETIC_FAIL_RULE_IDS) {
    await prisma.finding.update({
      where: { id: `${auditId}:${ruleId}` },
      data: { outcome: 'fail', severity: 'warning', evidence: { status: 'failure', seeded: 'demo' } },
    });
  }
  console.log(`Seeded ${SYNTHETIC_FAIL_RULE_IDS.length} actionable Finding(s) on Audit ${auditId}`);
}

async function advanceAction(campaignId, actionId) {
  await api('POST', `/campaigns/${campaignId}/actions/${actionId}/status`, { status: 'in-progress' });
  await api('POST', `/campaigns/${campaignId}/actions/${actionId}/status`, { status: 'completed' });
  await api('POST', `/campaigns/${campaignId}/actions/${actionId}/status`, { status: 'verified' });
}

async function main() {
  console.log(`Seeding demo workspace against API_URL=${API_URL}`);
  const prisma = getPrismaClient(config.DATABASE_URL);

  try {
    const client = await findOrCreateDemoClient();

    const initialAudit = await api('POST', '/audits', { url: DEMO_URL, clientId: client.id });
    const initialAuditMetadata = await api('GET', `/audits/${initialAudit.id}`);
    const projectId = initialAuditMetadata.projectId;
    console.log(`Created Demo Project: ${projectId}, Baseline Audit: ${initialAudit.id}`);

    await seedActionableFindings(initialAudit.id, prisma);

    await api('POST', `/projects/${projectId}/baseline`, { auditId: initialAudit.id });
    console.log('Baseline set.');

    const campaign = await api('POST', `/projects/${projectId}/campaigns`, undefined);
    console.log(`Created Optimization Campaign: ${campaign.id} with ${campaign.actions.length} action(s)`);

    if (campaign.actions.length > 0) {
      await api('POST', `/campaigns/${campaign.id}/status`, { status: 'active' });
      for (const action of campaign.actions) {
        await advanceAction(campaign.id, action.id);
      }
      await api('POST', `/campaigns/${campaign.id}/status`, { status: 'completed' });
      console.log(`Advanced Campaign and verified ${campaign.actions.length} Optimization Action(s).`);
    }

    const verificationAudit = await api('POST', '/audits', { url: DEMO_URL, clientId: client.id });
    console.log(`Created Verification Audit: ${verificationAudit.id}`);

    // The Cycle is a per-Project singleton reused across re-runs (unlike the Client/Project
    // themselves, it has no "create a new one" path here) — a prior run, or manual advancement
    // through the UI, may have already moved it past 'running'. Only 'running' -> 'verification'
    // is a valid forward transition; anything else means this step is already done, and repeating
    // it would throw (`InvalidCycleStateTransitionError`) and abort the whole script under
    // `start-alpha.sh`'s `set -e`, taking down the Backend/Frontend it had just started.
    const cycle = await api('GET', `/projects/${projectId}/cycles/current`);
    if (cycle.status === 'running') {
      await api('POST', `/cycles/${cycle.id}/status`, { status: 'verification' });
      console.log(`Optimization Cycle ${cycle.id} advanced to 'verification'.`);
    } else {
      console.log(`Optimization Cycle ${cycle.id} is already '${cycle.status}' — skipping transition.`);
    }

    console.log('\nDemo workspace ready:');
    console.log(`  Client ID:   ${client.id}`);
    console.log(`  Project ID:  ${projectId}`);
    console.log(`  Cycle ID:    ${cycle.id}`);
    console.log(`  Dashboard:   /projects/${projectId}/dashboard`);
    console.log(`  Report:      /projects/${projectId}/cycles/${cycle.id}/report`);
    console.log(`  Consultant:  /projects/${projectId}/consultant`);
    console.log('  Daily Briefing is visible on the workspace home page (/).');
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error('Demo seed failed:', error.message);
  console.error(`Is the API running and reachable at ${API_URL}?`);
  process.exit(1);
});
