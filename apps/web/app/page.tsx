import type { Metadata } from 'next';
import Link from 'next/link';
import { loadConfig } from '@ai-visibility/config';
import { Badge, Card } from './components/ui';

export const metadata: Metadata = {
  title: 'AI Visibility Auditor — Understand How AI Sees Your Brand',
  description:
    'Measure, explain and improve how AI systems represent your business across modern conversational platforms.',
  openGraph: {
    title: 'AI Visibility Auditor',
    description:
      'Measure, explain and improve how AI systems represent your business across modern conversational platforms.',
    type: 'website',
  },
};

const VALUE_PILLARS = [
  {
    title: 'Measurable',
    description:
      'Every Audit produces a structured AI Visibility status, backed by concrete Findings — not a vague impression.',
  },
  {
    title: 'Explainable',
    description:
      'Every recommendation carries its own reasoning: which Findings triggered it, what evidence supports it, and what outcome to expect.',
  },
  {
    title: 'Actionable',
    description:
      'Findings become an Optimization Plan, the Plan becomes a trackable Campaign, and every Action can be verified against a new Audit.',
  },
];

const WORKFLOW_STEPS = [
  { title: 'Audit', description: "Run a complete AI Visibility Audit against your client's website." },
  { title: 'Analyze', description: 'Review the Findings and the AI Visibility status they produce.' },
  { title: 'Optimize', description: 'Turn Findings into a prioritized, evidence-based Optimization Plan.' },
  { title: 'Verify', description: 'Track Optimization Actions through a Campaign as work gets done.' },
  { title: 'Measure Impact', description: 'Re-audit and compare against the Baseline to confirm real change.' },
  { title: 'Continuous Improvement', description: 'Close the Optimization Cycle and start the next one.' },
];

const CAPABILITIES = [
  {
    title: 'AI Visibility Audits',
    description:
      "Run a complete Audit against any website and get a structured AI Visibility status, Findings, and an Optimization Plan back in seconds.",
  },
  {
    title: 'AI Consultant',
    description:
      'Ask questions about a Project and get proactive, evidence-based recommendations — derived entirely from your own platform data, never invented.',
  },
  {
    title: 'Optimization Campaigns',
    description:
      'Turn an Optimization Plan into trackable work, with Actions your team advances from pending through verified.',
  },
  {
    title: 'Executive Reports',
    description:
      'A structured, client-ready report summarizing Key Findings, Actions Completed, and measured Impact for every Optimization Cycle.',
  },
  {
    title: 'Continuous Verification',
    description:
      'Re-audit any Project to confirm whether completed work actually improved AI Visibility — Findings resolved, and Findings introduced.',
  },
  {
    title: 'Business Impact Analysis',
    description:
      'Compare a Baseline Audit against a Verification Audit to see exactly what changed: AI Visibility status, entity coverage, and resolved Findings.',
  },
];

export default async function LandingPage() {
  const config = loadConfig();

  return (
    <>
      <main className="marketing">
        <section className="hero" id="hero">
          <div className="hero__content">
            <h1>Understand How AI Sees Your Brand.</h1>
            <p className="hero__subheadline">
              Measure, explain and improve how AI systems represent your business across modern conversational
              platforms.
            </p>
            <div className="cluster">
              <Link href="/onboarding" className="btn btn-primary">
                Start Free Audit
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="marketing-section" id="product">
          <h2>AI Visibility You Can Trust</h2>
          <p className="marketing-section__intro">
            AI Visibility is a new, measurable dimension of how your brand is represented — not a guess.
          </p>
          <div className="grid-3">
            {VALUE_PILLARS.map((pillar) => (
              <Card key={pillar.title} muted>
                <h3>{pillar.title}</h3>
                <p className="text-secondary">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="marketing-section" id="how-it-works">
          <h2>How It Works</h2>
          <p className="marketing-section__intro">
            One continuous lifecycle, from first Audit to measured business impact.
          </p>
          <ol className="workflow">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.title} className="workflow__step">
                <span className="workflow__number" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="text-secondary">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="marketing-section" id="platform">
          <h2>Built for the Full Optimization Lifecycle</h2>
          <p className="marketing-section__intro">Every capability below is available in the platform today.</p>
          <div className="grid-3">
            {CAPABILITIES.map((capability) => (
              <Card key={capability.title} muted>
                <h3>{capability.title}</h3>
                <p className="text-secondary">{capability.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="marketing-section" id="about">
          <h2>Why AI Visibility Matters</h2>
          <div className="marketing-prose">
            <p>
              A growing share of purchase research and vendor discovery now happens through conversational AI
              systems rather than traditional search results. When those systems cannot accurately find,
              understand, or represent a brand, that brand becomes effectively invisible within an entirely new
              category of buyer interactions.
            </p>
            <p>
              This is a measurable, addressable problem — not a matter of chance. AI Visibility Auditor gives
              agencies a structured way to assess that exposure, explain its root causes with evidence, and track
              measurable progress toward resolving it over time.
            </p>
          </div>
        </section>

        <section className="marketing-section" id="dashboard-preview">
          <h2>See Inside the Platform</h2>
          <p className="marketing-section__intro">
            An illustrative look at the Executive Dashboard every Project gets — not real client data.
          </p>
          <Card>
            <div className="card__header">
              <div>
                <h3>example.com</h3>
                <p className="text-secondary">Acme Digital · Illustrative Project</p>
              </div>
              <Badge variant="success">ready</Badge>
            </div>
            <div className="grid-3">
              <div className="preview-stat">
                <p className="text-tertiary">Baseline</p>
                <Badge variant="success">Set</Badge>
              </div>
              <div className="preview-stat">
                <p className="text-tertiary">Optimization Cycle</p>
                <Badge variant="primary">verification</Badge>
              </div>
              <div className="preview-stat">
                <p className="text-tertiary">Campaign</p>
                <Badge variant="primary">active</Badge>
              </div>
            </div>
          </Card>
        </section>

        <section className="marketing-final-cta">
          <h2>See how AI systems represent your brand today.</h2>
          <div className="cluster" style={{ justifyContent: 'center' }}>
            <Link href="/onboarding" className="btn btn-primary">
              Start Free Audit
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-footer__links">
          <a href="#product">Product</a>
          <a href={`${config.API_URL}/docs`} target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
          <span className="marketing-footer__inert" title="Not yet available">
            Privacy
          </span>
          <span className="marketing-footer__inert" title="Not yet available">
            Terms
          </span>
          <span className="marketing-footer__inert" title="Not yet available">
            Contact
          </span>
        </div>
        <p className="text-tertiary">© {new Date().getFullYear()} AI Visibility Auditor. All rights reserved.</p>
      </footer>
    </>
  );
}
