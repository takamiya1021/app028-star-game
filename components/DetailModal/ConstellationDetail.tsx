import { useMemo } from 'react';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';
import DetailSection from './DetailSection';
import { getStarDisplayName } from './detailUtils';

interface ConstellationDetailProps {
  constellation: Constellation;
  stars?: Star[];
}

function resolveHemisphereLabel(hemisphere: Constellation['hemisphere']) {
  switch (hemisphere) {
    case 'north':
      return '北天';
    case 'south':
      return '南天';
    default:
      return '全天';
  }
}

function resolveDifficultyLabel(difficulty: Constellation['difficulty']) {
  switch (difficulty) {
    case 'easy':
      return '初級';
    case 'medium':
      return '中級';
    case 'hard':
      return '上級';
    default:
      return difficulty;
  }
}

export function ConstellationDetail({ constellation, stars }: ConstellationDetailProps) {
  const starLookup = useMemo(() => {
    if (!stars?.length) return new Map<number, Star>();
    return new Map(stars.map((star) => [star.id, star]));
  }, [stars]);

  const hemisphereLabel = useMemo(
    () => resolveHemisphereLabel(constellation.hemisphere),
    [constellation.hemisphere]
  );
  const difficultyLabel = useMemo(
    () => resolveDifficultyLabel(constellation.difficulty),
    [constellation.difficulty]
  );
  const mainStarNames = useMemo(
    () =>
      constellation.mainStars
        .map((id) => getStarDisplayName(starLookup.get(id)))
        .filter((name): name is string => Boolean(name)),
    [constellation.mainStars, starLookup]
  );

  const mythologyText =
    constellation.mythology && constellation.mythology.trim().length > 0
      ? constellation.mythology
      : '神話情報は登録されていません。';

  const seasonalText =
    constellation.season && constellation.season.trim().length > 0
      ? `${constellation.season}に見頃です。`
      : null;

  return (
    <article className="space-y-4 text-white" aria-label={`${constellation.nameJa}の詳細`}>
      <header>
        <h2 className="text-2xl font-bold leading-tight">{constellation.nameJa}</h2>
        <p className="text-sm text-blue-200">
          {constellation.name} / {hemisphereLabel} / 難易度: {difficultyLabel}
        </p>
      </header>

      <DetailSection title="神話・由来" ariaLabel="神話と見頃の情報">
        <p className="leading-relaxed text-blue-100">{mythologyText}</p>
        {seasonalText && (
          <p className="mt-1 text-xs text-blue-200" aria-label="観測シーズン">
            {seasonalText}
          </p>
        )}
      </DetailSection>

      <DetailSection title="代表的な恒星">
        {mainStarNames.length > 0 ? (
          <ul className="list-inside list-disc space-y-1">
            {mainStarNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-blue-100">代表的な恒星情報はありません。</p>
        )}
      </DetailSection>
    </article>
  );
}

export default ConstellationDetail;
'use client';
