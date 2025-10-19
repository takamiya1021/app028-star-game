'use client';

import ConstellationDetail from '@/components/DetailModal/ConstellationDetail';
import StarDetail from '@/components/DetailModal/StarDetail';
import { getStarDisplayName } from '@/components/DetailModal/detailUtils';
import { FadeIn } from '@/components/Animate/FadeIn';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';

interface ConstellationModalProps {
  constellation: Constellation;
  stars: Star[];
  selectedStarId: number | null;
  onSelectStar: (starId: number) => void;
  onClose: () => void;
}

export default function ConstellationModal({
  constellation,
  stars,
  selectedStarId,
  onSelectStar,
  onClose,
}: ConstellationModalProps) {
  const activeStar = selectedStarId ? stars.find((star) => star.id === selectedStarId) ?? null : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${constellation.nameJa}の詳細情報`}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-8"
    >
      <FadeIn
        as="section"
        className="relative flex w-full max-w-4xl flex-col gap-6 overflow-y-auto rounded-3xl bg-slate-950/95 p-6 shadow-2xl backdrop-blur"
        data-testid="constellation-modal"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
          aria-label="図鑑詳細を閉じる"
        >
          ×
        </button>

        <ConstellationDetail constellation={constellation} stars={stars} />

        {stars.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">主要な恒星</h3>
            <div className="flex flex-wrap gap-2">
              {stars.map((star) => {
                const name = getStarDisplayName(star) ?? `HIP ${star.id}`;
                const isActive = star.id === selectedStarId;
                return (
                  <button
                    key={star.id}
                    type="button"
                    onClick={() => onSelectStar(star.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-blue-100 hover:border-blue-400/70 hover:bg-blue-500/10'
                    }`}
                    aria-label={`${name}の詳細を見る`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeStar && <StarDetail star={activeStar} constellation={constellation} />}
      </FadeIn>
    </div>
  );
}
