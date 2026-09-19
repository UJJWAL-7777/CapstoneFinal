import { CASE_STATUSES } from '../utils/constants.js';

// Visual track of the eight case stages. Reused by the case workspace later.
export default function CaseStatusTrack({ current }) {
  const idx = CASE_STATUSES.indexOf(current);
  return (
    <ol className="space-y-0" aria-label="Case progress">
      {CASE_STATUSES.map((status, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={status} className="relative flex items-center gap-3 py-1.5">
            {i < CASE_STATUSES.length - 1 && (
              <span aria-hidden className={`absolute left-[7px] top-[22px] h-full w-px ${done ? 'bg-chamber-500' : 'bg-line'}`} />
            )}
            <span
              aria-hidden
              className={`relative z-10 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                active ? 'border-brass-500 bg-brass-500 ring-4 ring-brass-100' : done ? 'border-chamber-500 bg-chamber-500' : 'border-line bg-white'
              }`}
            />
            <span className={`text-sm ${active ? 'font-semibold text-ink' : done ? 'text-ink-soft' : 'text-ink-muted'}`}>
              {status}
              {active && <span className="sr-only"> (current stage)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
