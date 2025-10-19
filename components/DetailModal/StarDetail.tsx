import { useMemo } from 'react';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';
import DetailSection from './DetailSection';
import { getStarDisplayName } from './detailUtils';

interface StarDetailProps {
  star: Star;
  constellation?: Constellation;
}

function formatMagnitude(star: Star) {
  if (typeof star.vmag === 'number') {
    return `等級: ${star.vmag.toFixed(1)}`;
  }
  return '等級情報は未登録';
}

function formatSpectralType(star: Star) {
  if (star.spectralType && star.spectralType.trim().length > 0) {
    return `スペクトル型: ${star.spectralType}`;
  }
  return 'スペクトル情報は未登録';
}

function computeDistance(parallax: number | null | undefined) {
  if (!parallax || parallax <= 0) return null;
  const parsecs = 1000 / parallax;
  const lightYears = parsecs * 3.26156;
  return {
    parsecs,
    lightYears,
  };
}

function formatDistance(parallax: number | null | undefined) {
  const distance = computeDistance(parallax);
  if (!distance) return '距離情報は未登録';
  const roundedLy = Math.round(distance.lightYears);
  const roundedPc = Math.round(distance.parsecs * 10) / 10;
  return `距離: 約 ${roundedLy} 光年 (${roundedPc} pc)`;
}

function renderIdentifiers(star: Star) {
  const identifiers: string[] = [];
  if (typeof star.hd === 'number') {
    identifiers.push(`HD ${star.hd}`);
  }
  if (typeof star.hr === 'number') {
    identifiers.push(`HR ${star.hr}`);
  }
  identifiers.push(`HIP ${star.id}`);
  return identifiers;
}

export function StarDetail({ star, constellation }: StarDetailProps) {
  const name = useMemo(() => getStarDisplayName(star) ?? `HIP ${star.id}`, [star]);
  const identifiers = useMemo(() => renderIdentifiers(star), [star]);
  const magnitudeText = useMemo(() => formatMagnitude(star), [star]);
  const spectralText = useMemo(() => formatSpectralType(star), [star]);
  const distanceText = useMemo(() => formatDistance(star.parallax), [star.parallax]);

  return (
    <article className="space-y-4 text-white" aria-label={`${name} の詳細`}>
      <header>
        <h2 className="text-2xl font-bold leading-tight">{name}</h2>
        {constellation && (
          <p className="text-sm text-blue-200">所属: {constellation.nameJa}</p>
        )}
      </header>

      <DetailSection title="物理特性">
        <ul className="space-y-1 text-blue-100">
          <li>{spectralText}</li>
          <li>{magnitudeText}</li>
          <li>{distanceText}</li>
        </ul>
      </DetailSection>

      <DetailSection title="識別番号">
        <ul className="list-inside list-disc space-y-1">
          {identifiers.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </DetailSection>
    </article>
  );
}

export default StarDetail;
'use client';
