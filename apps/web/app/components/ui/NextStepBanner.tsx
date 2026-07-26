import Link from 'next/link';
import type { NextStep } from '../../lib/next-step';

export function NextStepBanner({ step }: { step: NextStep }) {
  return (
    <div className="next-step">
      <div className="next-step__body">
        <p className="next-step__eyebrow">Next Recommended Action</p>
        <h2 className="next-step__title">{step.title}</h2>
        <p className="next-step__description">{step.description}</p>
      </div>
      <Link href={step.href} className="btn btn-primary next-step__cta">
        {step.ctaLabel}
      </Link>
    </div>
  );
}
