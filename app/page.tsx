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
import { useQuiz } from '@/context/QuizContext';
import { useSettings } from '@/context/SettingsContext';
import { useBreakpoint } from '@/lib/ui/useBreakpoint';
import { PageTransition } from '@/components/Animate/PageTransition';
import { FadeIn } from '@/components/Animate/FadeIn';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Stellarium Quiz';

export default function Home() {
  const [visibleStarCount, setVisibleStarCount] = useState(0);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('orthographic');
  const [observationMode, setObservationMode] = useState<ObservationMode>('naked-eye');
  const [allStars, setAllStars] = useState<Star[]>([]);
  const [isMobileQuizOpen, setMobileQuizOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isCanvasSupported, setCanvasSupported] = useState(true);

  const { currentQuiz, submitAnswer, correctCount, totalCount } = useQuiz();
  const { settings } = useSettings();
  const breakpoint = useBreakpoint();

  // クイズターゲット（星空自動移動用）
  const quizTarget = useMemo(() => {
    if (!currentQuiz || !currentQuiz.viewCenter || !currentQuiz.zoomLevel) {
      return null;
    }
    return {
      viewCenter: currentQuiz.viewCenter,
      zoomLevel: currentQuiz.zoomLevel,
    };
  }, [currentQuiz]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStars() {
      try {
        const data = await loadStars();
        if (!cancelled) {
          setAllStars(data);
          setLoadError(null);
        }
      } catch (error) {
        console.error('星データの読み込みに失敗しました', error);
        if (!cancelled) {
          setLoadError('星データの読み込みに失敗しました');
        }
      }
    }
    fetchStars();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

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

  const retryLoadStars = useCallback(() => {
    setLoadAttempt((prev) => prev + 1);
  }, []);

  const handleCanvasSupportChange = useCallback((supported: boolean) => {
    setCanvasSupported(supported);
    if (!supported) {
      setVisibleStarCount(0);
    }
  }, []);

  // 星クリック時の処理（find-starクイズ用）
  const handleStarClick = useCallback((star: Star | null) => {
    // find-starクイズでない場合は何もしない
    if (!currentQuiz || currentQuiz.type !== 'find-star') return;

    // 星がクリックされた場合、その星の固有名を回答として送信
    if (star && star.properName) {
      submitAnswer(star.properName);
    }
  }, [currentQuiz, submitAnswer]);

  useEffect(() => {
    if (breakpoint !== 'sm') {
      setMobileQuizOpen(false);
    }
  }, [breakpoint]);

  // クイズ開始時に自動的にプラネタリウムビューに切り替え
  useEffect(() => {
    if (currentQuiz && projectionMode !== 'stereographic') {
      setProjectionMode('stereographic');
    }
  }, [currentQuiz, projectionMode]);

  return (
    <PageTransition className="h-screen w-full overflow-hidden bg-gradient-to-br from-black via-slate-900 to-indigo-950">
      <StarField
        stars={stars}
        viewCenter={{ ra: 90, dec: 0 }}
        zoom={2.0}
        className="h-full w-full"
        onVisibleCountChange={setVisibleStarCount}
        projectionMode={projectionMode}
        onCanvasSupportChange={handleCanvasSupportChange}
        labelPreferences={{
          showProperNames: settings.showProperNames,
          showBayerDesignations: settings.showBayerDesignations,
        }}
        milkyWayGlow={observationMode === 'telescope' ? 'telescope' : 'naked-eye'}
        quizTarget={quizTarget}
        onStarClick={handleStarClick}
      />

      <header className="pointer-events-none absolute inset-x-0 top-6 hidden justify-center px-4 sm:flex">
        <FadeIn className="pointer-events-auto rounded-2xl bg-black/40 px-4 py-2 text-center text-white shadow-lg backdrop-blur" data-motion="fade-in-header">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">✨ {APP_NAME} ✨</h1>
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">
            星々の海を旅しながらクイズに挑戦しよう
          </p>
        </FadeIn>
      </header>

      {loadError && (
        <div
          role="alert"
          className="pointer-events-auto absolute left-1/2 top-28 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={retryLoadStars}
            className="rounded-md border border-white/50 px-3 py-1 text-xs font-semibold transition hover:border-white"
          >
            再読み込み
          </button>
        </div>
      )}

      {!isCanvasSupported && (
        <div
          role="alert"
          className="pointer-events-auto absolute left-1/2 top-44 flex w-[90%] max-w-xl -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/20 px-4 py-3 text-center text-sm text-amber-50 shadow-lg backdrop-blur"
        >
          <p className="font-semibold">お使いのブラウザではCanvasがサポートされていません。</p>
          <p className="text-xs text-amber-100">最新のブラウザに更新するか、別のデバイスで再度お試しください。</p>
        </div>
      )}

      <aside className="pointer-events-none absolute right-6 top-28 hidden w-full max-w-sm flex-col gap-4 xl:flex">
        <QuizContainer />
      </aside>

      <div className="pointer-events-auto absolute left-1/2 top-[48%] hidden -translate-x-1/2 flex-col items-center gap-1 rounded-2xl bg-black/35 px-4 py-3 text-white shadow-lg backdrop-blur md:flex xl:hidden">
        <p className="text-sm font-semibold">現在の空</p>
        <p className="text-xs text-blue-100">表示中: {visibleStarCount.toLocaleString()} 個</p>
        <p className="text-xs text-blue-100">データ総数: {allStars.length.toLocaleString()} 件</p>
      </div>

      {isMobileQuizOpen && (
        <div
          className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center px-4 pb-6 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="クイズパネル"
        >
          <FadeIn as="div" id="mobile-quiz-panel" className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900/95 shadow-2xl backdrop-blur">
            <div className="border-b border-white/10 px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-200 whitespace-nowrap">
                    {correctCount}/{totalCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeMobileQuiz}
                  className="h-8 w-8 rounded-full bg-white/10 text-lg leading-none text-white transition hover:bg-white/20"
                  aria-label="クイズパネルを閉じる"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              <QuizContainer />
            </div>
          </FadeIn>
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
              className="flex h-14 w-full flex-1 items-center justify-between rounded-2xl bg-purple-600/80 px-4 text-base font-semibold text-white shadow-lg transition hover:bg-purple-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:max-w-xs"
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleMobileQuiz}
              className="flex h-14 items-center justify-center rounded-2xl bg-white/15 px-6 text-base font-semibold text-white shadow-lg transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:hidden"
              aria-expanded={isMobileQuizOpen}
              aria-controls="mobile-quiz-panel"
            >
              クイズを開く
              <span className="ml-3 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold">
                {correctCount}/{totalCount || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
