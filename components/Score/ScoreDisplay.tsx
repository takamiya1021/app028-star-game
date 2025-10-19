import type { Score } from '@/types/quiz';
import { mergeClassNames } from '@/lib/ui/breakpoints';

interface ScoreDisplayProps {
  score: Score;
  streak?: number;
  label?: string;
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolvePercentage({ correct, total, percentage }: Score) {
  if (total <= 0) return 0;
  const computed = Math.round((correct / total) * 100);
  const candidate = Number.isFinite(percentage) ? Math.round(percentage) : computed;
  return clamp(candidate, 0, 100);
}

export function ScoreDisplay({ score, streak, label = '現在のスコア', className }: ScoreDisplayProps) {
  const safeTotal = Math.max(score.total, 0);
  const displayPercentage = resolvePercentage(score);
  const containerClass = mergeClassNames(
    'rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/10 p-5 text-white shadow-lg backdrop-blur',
    className
  );

  return (
    <section
      aria-label={label}
      className={containerClass}
      data-testid="score-display"
    >
      <header className="flex items-baseline justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">{label}</p>
        <span className="text-lg font-bold text-blue-200">{displayPercentage}%</span>
      </header>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-extrabold leading-none">{score.correct}</span>
        <span className="pb-1 text-lg text-blue-100">/ {safeTotal}</span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-400 transition-all duration-300 ease-out"
          style={{ width: `${displayPercentage}%` }}
          role="progressbar"
          aria-valuenow={displayPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {typeof streak === 'number' && streak > 0 && (
        <p className="mt-3 text-xs text-blue-100">連続正解: {streak}</p>
      )}
    </section>
  );
}

export default ScoreDisplay;
