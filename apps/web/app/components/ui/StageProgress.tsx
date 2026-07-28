'use client';

import { useTranslations } from '../../../lib/i18n/client';

export function StageProgress({ stages, current }: { stages: string[]; current: string }) {
  const tCommon = useTranslations('common');
  const currentIndex = stages.indexOf(current);

  return (
    <ol className="stage-progress" aria-label={tCommon('stageProgress')}>
      {stages.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li
            key={stage}
            className={`stage-progress__step stage-progress__step--${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="stage-progress__dot" aria-hidden="true">
              {state === 'done' ? '✓' : index + 1}
            </span>
            <span className="stage-progress__label">{stage}</span>
          </li>
        );
      })}
    </ol>
  );
}
