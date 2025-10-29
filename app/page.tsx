'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import StarField, { FocusProgram as StarFieldFocusProgram } from '@/components/StarField/StarField';
import { ProjectionMode } from '@/lib/canvas/coordinateUtils';
import {
  ObservationMode,
  OBSERVATION_MODE_LABELS,
  OBSERVATION_MODE_DESCRIPTIONS,
  OBSERVATION_MODE_ICONS,
} from '@/types/observationMode';
import type { Star } from '@/types/star';
import type { ConstellationLine, Constellation } from '@/types/constellation';
import { loadStars } from '@/lib/data/starsLoader';
import { loadConstellationLines } from '@/lib/data/constellationLinesLoader';
import { loadConstellations } from '@/lib/data/constellationsLoader';
import QuizContainer from '@/components/Quiz/QuizContainer';
import { useQuiz } from '@/context/QuizContext';
import { useSettings } from '@/context/SettingsContext';
import { useBreakpoint } from '@/lib/ui/useBreakpoint';
import { PageTransition } from '@/components/Animate/PageTransition';
import { FadeIn } from '@/components/Animate/FadeIn';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Stellarium Quiz';

const DEFAULT_VIEW_CENTER = { ra: 90, dec: 0 };
const DEFAULT_ZOOM_LEVEL = 2.0;

interface ConstellationFocus {
  viewCenter: { ra: number; dec: number };
  zoomLevel: number;
}

interface ConstellationOption extends ConstellationFocus {
  id: string;
  labelJa: string;
  labelEn: string;
}

export default function Home() {
  const [visibleStarCount, setVisibleStarCount] = useState(0);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('orthographic');
  const [observationMode, setObservationMode] = useState<ObservationMode>('naked-eye');
  const [allStars, setAllStars] = useState<Star[]>([]);
  const [constellationLines, setConstellationLines] = useState<ConstellationLine[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [isMobileQuizOpen, setMobileQuizOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isCanvasSupported, setCanvasSupported] = useState(true);
  const [focusProgram, setFocusProgram] = useState<StarFieldFocusProgram | null>(null);
  const [lastCompletedProgramId, setLastCompletedProgramId] = useState<string | null>(null);
  const currentViewStateRef = useRef({
    viewCenter: { ...DEFAULT_VIEW_CENTER },
    zoom: DEFAULT_ZOOM_LEVEL,
  });
  const [selectedConstellationId, setSelectedConstellationId] = useState<string>('');

  const { currentQuiz, submitAnswer, correctCount } = useQuiz();
  const { settings, updateSettings } = useSettings();
  const breakpoint = useBreakpoint();

  const quizProgram = useMemo<StarFieldFocusProgram | null>(() => {
    if (!currentQuiz || !currentQuiz.viewCenter || !currentQuiz.zoomLevel) {
      return null;
    }
    return {
      id: `quiz-${currentQuiz.id}`,
      steps: [
        {
          viewCenter: currentQuiz.viewCenter,
          zoomLevel: currentQuiz.zoomLevel,
          duration: 800,
        },
      ],
    };
  }, [currentQuiz]);

  const activeFocusProgram = useMemo<StarFieldFocusProgram | null>(() => {
    if (focusProgram) {
      return focusProgram;
    }
    if (quizProgram && quizProgram.id !== lastCompletedProgramId) {
      return quizProgram;
    }
    return null;
  }, [focusProgram, quizProgram, lastCompletedProgramId]);

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

  useEffect(() => {
    let cancelled = false;
    async function fetchConstellationData() {
      try {
        const [linesData, constellationsData] = await Promise.all([
          loadConstellationLines(),
          loadConstellations(),
        ]);
        if (!cancelled) {
          setConstellationLines(linesData);
          setConstellations(constellationsData);
        }
      } catch (error) {
        console.error('星座データの読み込みに失敗しました', error);
      }
    }
    fetchConstellationData();
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

  const constellationFocusMap = useMemo(() => {
    if (constellationLines.length === 0 || allStars.length === 0) {
      return new Map<string, ConstellationFocus>();
    }

    const starMap = new Map<number, Star>();
    allStars.forEach((star) => {
      starMap.set(star.id, star);
    });

    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    const computeFocus = (starsInConstellation: Star[]): ConstellationFocus => {
      if (starsInConstellation.length === 0) {
        return {
          viewCenter: { ra: 0, dec: 0 },
          zoomLevel: 1.5,
        };
      }

      let sumX = 0;
      let sumY = 0;
      let sumDec = 0;
      starsInConstellation.forEach((star) => {
        const raRad = toRadians(star.ra);
        sumX += Math.cos(raRad);
        sumY += Math.sin(raRad);
        sumDec += star.dec;
      });

      const avgRaRad = Math.atan2(sumY / starsInConstellation.length, sumX / starsInConstellation.length);
      const avgRa = (toDegrees(avgRaRad) + 360) % 360;
      const avgDec = sumDec / starsInConstellation.length;
      const center = { ra: avgRa, dec: avgDec };

      const raOffsets = starsInConstellation.map((star) => {
        let diff = star.ra - center.ra;
        diff = ((diff + 540) % 360) - 180; // [-180, 180]
        return diff;
      });
      const raSpan = Math.max(...raOffsets) - Math.min(...raOffsets);
      const decValues = starsInConstellation.map((star) => star.dec);
      const decSpan = Math.max(...decValues) - Math.min(...decValues);
      const maxSpan = Math.max(raSpan, decSpan);

      let zoomLevel = 1.5;
      if (maxSpan > 50) zoomLevel = 0.5;
      else if (maxSpan > 30) zoomLevel = 0.8;
      else if (maxSpan > 20) zoomLevel = 1.0;
      else if (maxSpan > 15) zoomLevel = 1.2;

      return { viewCenter: center, zoomLevel };
    };

    const map = new Map<string, ConstellationFocus>();

    constellationLines.forEach((entry) => {
      const uniqueStarIds = new Set<number>();
      entry.lines.forEach((line) => {
        if (Array.isArray(line)) {
          line.forEach((id) => {
            if (typeof id === 'number') {
              uniqueStarIds.add(id);
            }
          });
        }
      });

      const starsInConstellation: Star[] = [];
      uniqueStarIds.forEach((id) => {
        const star = starMap.get(id);
        if (star) {
          starsInConstellation.push(star);
        }
      });

      if (starsInConstellation.length === 0) {
        return;
      }

      const focus = computeFocus(starsInConstellation);
      map.set(entry.constellationId, focus);
    });

    return map;
  }, [constellationLines, allStars]);

  const constellationOptions = useMemo(() => {
    if (constellations.length === 0 || constellationFocusMap.size === 0) {
      return [] as ConstellationOption[];
    }
    const collator = new Intl.Collator('ja');
    return constellations
      .map((cons) => {
        const focus = constellationFocusMap.get(cons.id);
        if (!focus) return null;
        return {
          id: cons.id,
          labelJa: cons.nameJa,
          labelEn: cons.name,
          viewCenter: focus.viewCenter,
          zoomLevel: focus.zoomLevel,
        } satisfies ConstellationOption;
      })
      .filter((item): item is ConstellationOption => item !== null)
      .sort((a, b) => collator.compare(a.labelJa, b.labelJa));
  }, [constellations, constellationFocusMap]);

  const isConstellationSelectorReady = constellationOptions.length > 0;
  const showConstellationLines = settings.showConstellationLines;

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

  const handleViewStateChange = useCallback((state: { viewCenter: { ra: number; dec: number }; zoom: number }) => {
    currentViewStateRef.current = {
      viewCenter: { ...state.viewCenter },
      zoom: state.zoom,
    };
  }, []);

  const handleToggleConstellationLines = useCallback(() => {
    updateSettings({ showConstellationLines: !settings.showConstellationLines });
  }, [settings.showConstellationLines, updateSettings]);

  const handleSelectConstellation = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setSelectedConstellationId(value);
      if (!value) return;

      const focus = constellationFocusMap.get(value);
      if (!focus) return;

      setProjectionMode('stereographic');
      const targetView = { ...focus.viewCenter };
      const targetZoom = Math.max(1.8, Math.min(focus.zoomLevel, 5));
      const initialView = {
        viewCenter: { ...currentViewStateRef.current.viewCenter },
        zoomLevel: currentViewStateRef.current.zoom,
      };

      setFocusProgram({
        id: `manual-${Date.now()}`,
        steps: [
          {
            viewCenter: targetView,
            zoomLevel: targetZoom,
            duration: 1200,
            hold: 1400,
          },
          {
            viewCenter: { ...initialView.viewCenter },
            zoomLevel: initialView.zoomLevel,
            duration: 1000,
          },
        ],
      });
    },
    [constellationFocusMap]
  );

  const handleFocusSequenceComplete = useCallback((completedId: string) => {
    setLastCompletedProgramId(completedId);
    setFocusProgram((prev) => {
      if (prev && prev.id === completedId) {
        return null;
      }
      return prev;
    });
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

  useEffect(() => {
    if (!currentQuiz) return;
    setSelectedConstellationId('');
  }, [currentQuiz]);

  return (
    <PageTransition className="h-screen w-full overflow-hidden bg-gradient-to-br from-black via-slate-900 to-indigo-950">
      <StarField
        stars={stars}
        constellationLines={constellationLines}
        viewCenter={DEFAULT_VIEW_CENTER}
        zoom={DEFAULT_ZOOM_LEVEL}
        className="h-full w-full"
        onVisibleCountChange={setVisibleStarCount}
        projectionMode={projectionMode}
        onCanvasSupportChange={handleCanvasSupportChange}
        labelPreferences={{
          showProperNames: settings.showProperNames,
          showBayerDesignations: settings.showBayerDesignations,
        }}
        showConstellationLines={settings.showConstellationLines}
        milkyWayGlow={observationMode === 'telescope' ? 'telescope' : 'naked-eye'}
        focusProgram={activeFocusProgram}
        onFocusSequenceComplete={handleFocusSequenceComplete}
        onViewStateChange={handleViewStateChange}
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

      <div className="pointer-events-auto absolute left-1/2 top-[48%] hidden w-fit -translate-x-1/2 flex-col items-center rounded bg-black/35 text-white shadow backdrop-blur md:flex xl:hidden">
        <p className="m-0 text-[8px] font-semibold leading-none">現在の空</p>
        <p className="m-0 text-[7px] leading-none text-blue-100">表示中: {visibleStarCount.toLocaleString()} 個</p>
        <p className="m-0 text-[7px] leading-none text-blue-100">データ総数: {allStars.length.toLocaleString()} 件</p>
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
                      style={{ width: `${Math.round((correctCount / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-200 whitespace-nowrap">
                    {correctCount}/10
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
              <span className="text-xs text-purple-50/80">{observationMode === 'naked-eye' ? '7等星まで表示' : OBSERVATION_MODE_DESCRIPTIONS[observationMode]}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleConstellationLines}
              className={`inline-flex h-10 max-w-[160px] items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                showConstellationLines
                  ? 'bg-sky-600/80 hover:bg-sky-500/90'
                  : 'bg-slate-700/80 hover:bg-slate-600/90'
              }`}
              aria-pressed={showConstellationLines}
              aria-label="星座線の表示を切り替える"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{showConstellationLines ? '✨' : '🚫'}</span>
                <span>星座線</span>
              </span>
            </button>

            <div className="inline-flex h-10 max-w-[160px] items-center gap-2 rounded-lg bg-indigo-500/80 px-2.5 text-white shadow-lg transition focus-within:ring-2 focus-within:ring-white/80 sm:max-w-[150px]">
              <span className="text-base" aria-hidden="true">🧭</span>
              <select
                value={selectedConstellationId}
                onChange={handleSelectConstellation}
                disabled={!isConstellationSelectorReady}
                className="h-7 min-w-[110px] rounded-md border border-white/30 bg-indigo-600/85 px-1.5 text-xs font-medium text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/80 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="表示する星座を選択する"
              >
                <option value="">
                  {isConstellationSelectorReady ? '星座を選択' : '星座を読み込み中...'}
                </option>
                {constellationOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.labelJa} / {option.labelEn}
                  </option>
                ))}
              </select>
            </div>
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
                {correctCount}/10
              </span>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
