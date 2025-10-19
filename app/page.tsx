'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import StarField from '@/components/StarField/StarField';
import { ProjectionMode } from '@/lib/canvas/coordinateUtils';
import {
  ObservationMode,
  OBSERVATION_MODE_LABELS,
  OBSERVATION_MODE_DESCRIPTIONS,
  OBSERVATION_MODE_ICONS,
} from '@/types/observationMode';
import type { Star } from '@/types/star';
import { loadStars } from '@/lib/data/starsLoader';
import QuizContainer from '@/components/Quiz/QuizContainer';
import ScoreDisplay from '@/components/Score/ScoreDisplay';
import { useQuiz } from '@/context/QuizContext';
import { useBreakpoint } from '@/lib/ui/useBreakpoint';

export default function Home() {
  const [visibleStarCount, setVisibleStarCount] = useState(0);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('orthographic');
  const [observationMode, setObservationMode] = useState<ObservationMode>('naked-eye');
  const [allStars, setAllStars] = useState<Star[]>([]);
  const [isMobileQuizOpen, setMobileQuizOpen] = useState(false);

  const { correctCount, totalCount, history } = useQuiz();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    let cancelled = false;
    loadStars()
      .then((data) => {
        if (!cancelled) {
          setAllStars(data);
        }
      })
      .catch((error) => {
        console.error('星データの読み込みに失敗しました', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stars = useMemo(() => {
    if (allStars.length === 0) {
      return [] as Star[];
    }
    if (observationMode === 'naked-eye') {
      return allStars.filter((star) => star.vmag !== null && star.vmag < 7);
    }
    return allStars;
  }, [allStars, observationMode]);

  const toggleProjection = useCallback(() => {
    setProjectionMode((prev) => (prev === 'orthographic' ? 'stereographic' : 'orthographic'));
  }, []);

  const toggleObservationMode = useCallback(() => {
    setObservationMode((prev) => (prev === 'naked-eye' ? 'telescope' : 'naked-eye'));
  }, []);

  const toggleMobileQuiz = useCallback(() => {
    setMobileQuizOpen((open) => !open);
  }, []);

  const closeMobileQuiz = useCallback(() => setMobileQuizOpen(false), []);

  useEffect(() => {
    if (breakpoint !== 'sm') {
      setMobileQuizOpen(false);
    }
  }, [breakpoint]);

  const score = useMemo(() => {
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    return { correct: correctCount, total: totalCount, percentage };
  }, [correctCount, totalCount]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].isCorrect) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [history]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-black via-slate-900 to-indigo-950">
      <StarField
        stars={stars}
        viewCenter={{ ra: 90, dec: 0 }}
        zoom={2.0}
        className="h-full w-full"
        onVisibleCountChange={setVisibleStarCount}
        projectionMode={projectionMode}
      />

      <header className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-4">
        <div className="pointer-events-auto rounded-2xl bg-black/40 px-4 py-2 text-center text-white shadow-lg backdrop-blur">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">✨ Stellarium Quiz ✨</h1>
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">
            星々の海を旅しながらクイズに挑戦しよう
          </p>
        </div>
      </header>

      <aside className="pointer-events-auto absolute right-6 top-28 hidden w-full max-w-sm flex-col gap-4 rounded-3xl bg-black/50 p-5 text-white shadow-2xl backdrop-blur-lg xl:flex">
        <ScoreDisplay score={score} streak={streak} label="現在のスコア" />
        <QuizContainer />
      </aside>

      <div className="pointer-events-auto absolute left-1/2 top-[48%] hidden -translate-x-1/2 flex-col items-center gap-1 rounded-2xl bg-black/35 px-4 py-3 text-white shadow-lg backdrop-blur md:flex xl:hidden">
        <p className="text-sm font-semibold">現在の空</p>
        <p className="text-xs text-blue-100">表示中: {visibleStarCount.toLocaleString()} 個</p>
        <p className="text-xs text-blue-100">データ総数: {allStars.length.toLocaleString()} 件</p>
      </div>

      {isMobileQuizOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-40 flex items-end justify-center bg-black/70 px-4 pb-6 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="クイズパネル"
        >
          <div id="mobile-quiz-panel" className="w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900/95 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
              <h2 className="text-lg font-semibold">星空クイズ</h2>
              <button
                type="button"
                onClick={closeMobileQuiz}
                className="h-10 w-10 rounded-full bg-white/10 text-xl leading-none text-white transition hover:bg-white/20"
                aria-label="クイズパネルを閉じる"
              >
                ×
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              <ScoreDisplay score={score} streak={streak} label="現在のスコア" className="bg-white/10" />
              <div className="mt-4">
                <QuizContainer />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 px-4 pb-6 pt-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl bg-black/60 p-4 text-white shadow-[0_-12px_30px_rgba(0,0,0,0.55)] backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
            <button
              type="button"
              onClick={toggleProjection}
              className="flex h-14 w-full flex-1 items-center justify-between rounded-2xl bg-blue-600/80 px-4 text-base font-semibold shadow-lg transition hover:bg-blue-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:max-w-xs"
              aria-pressed={projectionMode === 'stereographic'}
              aria-label="投影モードを切り替える"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{projectionMode === 'orthographic' ? '🌍' : '🔭'}</span>
                <span>{projectionMode === 'orthographic' ? '宇宙ビュー' : 'プラネタリウム'}</span>
              </span>
              <span className="text-xs text-blue-50/80">タップで切替</span>
            </button>

            <button
              type="button"
              onClick={toggleObservationMode}
              className="flex h-14 w-full flex-1 items-center justify-between rounded-2xl bg-purple-600/80 px-4 text-base font-semibold shadow-lg transition hover:bg-purple-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:max-w-xs"
              aria-pressed={observationMode === 'telescope'}
              aria-label="観測モードを切り替える"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{OBSERVATION_MODE_ICONS[observationMode]}</span>
                <span>{OBSERVATION_MODE_LABELS[observationMode]}</span>
              </span>
              <span className="text-xs text-purple-50/80">{OBSERVATION_MODE_DESCRIPTIONS[observationMode]}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-100 shadow-inner">
              <p className="font-semibold text-white">星の瞬き</p>
              <p className="mt-1 text-xs">表示数: {visibleStarCount.toLocaleString()} 個</p>
              <p className="text-xs text-blue-200">データ総数: {allStars.length.toLocaleString()} 件</p>
            </div>

            <button
              type="button"
              onClick={toggleMobileQuiz}
              className="flex h-14 items-center justify-center rounded-2xl bg-white/15 px-6 text-base font-semibold text-white shadow-lg transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:hidden"
              aria-expanded={isMobileQuizOpen}
              aria-controls="mobile-quiz-panel"
            >
              クイズを開く
              <span className="ml-3 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold">
                {score.correct}/{score.total || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
