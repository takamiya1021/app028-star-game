'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star } from '@/types/star';
import type { ConstellationLine } from '@/types/constellation';
import { ProjectionMode, ObserverLocation, celestialToScreen } from '@/lib/canvas/coordinateUtils';
import { drawStars } from '@/lib/canvas/starRenderer';
import { drawConstellationLines } from '@/lib/canvas/constellationRenderer';

export interface FocusStep {
  viewCenter: { ra: number; dec: number };
  zoomLevel: number;
  duration?: number;
  hold?: number;
}

export interface FocusProgram {
  id: string;
  steps: FocusStep[];
}

interface StarFieldProps {
  stars: Star[];
  constellationLines?: ConstellationLine[];
  viewCenter?: { ra: number; dec: number };
  zoom?: number;
  className?: string;
  onVisibleCountChange?: (count: number) => void;
  projectionMode?: ProjectionMode;
  onCanvasSupportChange?: (supported: boolean) => void;
  labelPreferences?: {
    showProperNames: boolean;
    showBayerDesignations: boolean;
  };
  showConstellationLines?: boolean;
  milkyWayGlow?: 'telescope' | 'naked-eye' | false;
  focusProgram?: FocusProgram | null;
  onFocusSequenceComplete?: (id: string) => void;
  onViewStateChange?: (state: { viewCenter: { ra: number; dec: number }; zoom: number }) => void;
  onStarClick?: (star: Star | null) => void;
}

// 東京の位置と観測日時（2025年1月1日 00:00:00 JST = 2024年12月31日 15:00:00 UTC）
const TOKYO_OBSERVER: ObserverLocation = {
  latitude: 35.7,
  longitude: 139.7,
  date: new Date('2024-12-31T15:00:00Z'), // UTC
};

const PAN_INTERVAL_MS = 16;

const getTimestamp = () => (
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
);

export default function StarField({
  stars,
  constellationLines = [],
  viewCenter: initialViewCenter = { ra: 180, dec: 0 },
  zoom: initialZoom = 1.5,
  className = '',
  onVisibleCountChange,
  projectionMode = 'orthographic',
  onCanvasSupportChange,
  labelPreferences,
  showConstellationLines = true,
  milkyWayGlow = 'telescope',
  focusProgram,
  onFocusSequenceComplete,
  onViewStateChange,
  onStarClick,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(initialZoom);
  const [viewCenter, setViewCenter] = useState(initialViewCenter);
  const viewCenterRef = useRef(viewCenter);
  const animationRef = useRef<number>();
  const focusAnimationRef = useRef<number | null>(null);
  const visibleCountRef = useRef<number>(0);
  const lastPanUpdateRef = useRef<number>(Number.NEGATIVE_INFINITY);

  const touchDistanceRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const zoomRef = useRef(initialZoom);
  const projectionModeRef = useRef(projectionMode);
  const canvasSupportRef = useRef<boolean | null>(null);
  const labelOptions = useMemo(
    () => ({
      showProperNames: labelPreferences?.showProperNames ?? true,
      showBayerDesignations: labelPreferences?.showBayerDesignations ?? true,
    }),
    [labelPreferences?.showProperNames, labelPreferences?.showBayerDesignations]
  );

  // 星座線描画用の星インデックス
  const starIndex = useMemo(() => {
    const index = new Map<number, Star>();
    stars.forEach((star) => {
      index.set(star.id, star);
    });
    return index;
  }, [stars]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    viewCenterRef.current = viewCenter;
  }, [viewCenter]);

  useEffect(() => {
    projectionModeRef.current = projectionMode;
  }, [projectionMode]);

  useEffect(() => {
    if (!onViewStateChange) return;
    onViewStateChange({ viewCenter: { ...viewCenter }, zoom });
  }, [viewCenter, zoom, onViewStateChange]);

  // フォーカスプログラムによる自動移動
  useEffect(() => {
    if (!focusProgram || focusProgram.steps.length === 0) return;

    let cancelled = false;
    let holdTimeout: ReturnType<typeof setTimeout> | null = null;

    const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animateToStep = (step: FocusStep): Promise<void> => {
      const duration = step.duration ?? 1000;
      if (duration <= 0) {
        const finalView = { ...step.viewCenter };
        setViewCenter(finalView);
        viewCenterRef.current = finalView;
        setZoom(step.zoomLevel);
        zoomRef.current = step.zoomLevel;
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const startView = viewCenterRef.current;
        const startZoom = zoomRef.current;
        const startTime = performance.now();

        const animate = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }

          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeInOutCubic(progress);

          let raDiff = step.viewCenter.ra - startView.ra;
          if (raDiff > 180) raDiff -= 360;
          if (raDiff < -180) raDiff += 360;
          const newRA = (startView.ra + raDiff * eased + 360) % 360;

          const newDec = startView.dec + (step.viewCenter.dec - startView.dec) * eased;
          const newZoom = startZoom + (step.zoomLevel - startZoom) * eased;

          if (progress < 1) {
            const intermediateView = { ra: newRA, dec: newDec };
            setViewCenter(intermediateView);
            viewCenterRef.current = intermediateView;
            setZoom(newZoom);
            focusAnimationRef.current = requestAnimationFrame(animate);
          } else {
            const finalView = { ...step.viewCenter };
            setViewCenter(finalView);
            viewCenterRef.current = finalView;
            setZoom(step.zoomLevel);
            zoomRef.current = step.zoomLevel;
            focusAnimationRef.current = null;
            resolve();
          }
        };

        focusAnimationRef.current = requestAnimationFrame(animate);
      });
    };

    const runSequence = async () => {
      for (const step of focusProgram.steps) {
        await animateToStep(step);
        if (cancelled) return;
        if (step.hold && step.hold > 0) {
          await new Promise<void>((resolve) => {
            holdTimeout = setTimeout(() => {
              holdTimeout = null;
              resolve();
            }, step.hold);
            if (cancelled) {
              resolve();
            }
          });
          if (cancelled) return;
        }
      }
      if (!cancelled) {
        onFocusSequenceComplete?.(focusProgram.id);
      }
    };

    runSequence();

    return () => {
      cancelled = true;
      if (focusAnimationRef.current) {
        cancelAnimationFrame(focusAnimationRef.current);
        focusAnimationRef.current = null;
      }
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }
    };
  }, [focusProgram, onFocusSequenceComplete]);

  // キャンバスサイズ調整
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      setCanvasSize({
        width: clientWidth || 800,
        height: clientHeight || 600,
      });
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const next = prev + delta;
      return Math.max(0.5, Math.min(20.0, next));
    });
  }, []);

  const setViewCenterThrottled = useCallback(
    (updater: (prev: { ra: number; dec: number }) => { ra: number; dec: number }) => {
      const now = getTimestamp();
      if (now - lastPanUpdateRef.current < PAN_INTERVAL_MS) {
        return;
      }
      lastPanUpdateRef.current = now;
      setViewCenter(updater);
    },
    []
  );

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;

    const currentZoom = zoomRef.current;
    const mode = projectionModeRef.current;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    const sensitivity = 0.2 / currentZoom;

    const deltaRA = mode === 'stereographic' ? deltaX * sensitivity : -deltaX * sensitivity;
    const deltaDec = deltaY * sensitivity;

    setViewCenterThrottled((prev) => ({
      ra: (prev.ra + deltaRA + 360) % 360,
      dec: Math.max(-90, Math.min(90, prev.dec + deltaDec)),
    }));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [setViewCenterThrottled]);

  const handleMouseUp = useCallback(() => {
    const canvas = canvasRef.current;
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
    if (canvas) canvas.style.cursor = 'grab';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const canvas = canvasRef.current;
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
    if (canvas) canvas.style.cursor = 'grab';
  }, []);

  // クリック座標から最も近い星を特定する関数
  const findNearestStar = useCallback((canvasX: number, canvasY: number): Star | null => {
    const canvas = canvasRef.current;
    if (!canvas || !onStarClick) return null;

    // Canvas座標を取得
    const rect = canvas.getBoundingClientRect();
    const clickX = canvasX - rect.left;
    const clickY = canvasY - rect.top;

    // 表示されている星の中から最も近い星を探す
    let nearestStar: Star | null = null;
    let minDistance = 50; // 50px以内の星のみ対象

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // すべての星をチェックして、クリック位置に最も近い星を見つける
    for (const star of stars) {
      if (star.vmag === null || star.vmag > 6) continue; // 6等級より明るい星のみ

      // 星のCanvas座標を計算
      const screenPos = celestialToScreen(
        star.ra,
        star.dec,
        viewCenter,
        zoom,
        canvasWidth,
        canvasHeight,
        projectionMode,
        TOKYO_OBSERVER
      );

      if (!screenPos) continue; // 画面外の星はスキップ

      // クリック位置との距離を計算
      const dx = screenPos.x - clickX;
      const dy = screenPos.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // より近い星を記録
      if (distance < minDistance) {
        minDistance = distance;
        nearestStar = star;
      }
    }

    return nearestStar;
  }, [stars, onStarClick, viewCenter, zoom, projectionMode]);

  // クリックイベントハンドラ
  const handleClick = useCallback((e: MouseEvent) => {
    // ドラッグ操作の場合はクリックとして扱わない
    if (isDraggingRef.current) return;
    if (!onStarClick) return;

    const nearestStar = findNearestStar(e.clientX, e.clientY);
    onStarClick(nearestStar);
  }, [findNearestStar, onStarClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = 'grab';
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    if (onStarClick) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (onStarClick) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleClick, onStarClick]);

  // タッチ操作でピンチズーム & スワイプ移動
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lastTouchPosRef = { current: null as { x: number; y: number } | null };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        touchDistanceRef.current = distance;
        lastTouchPosRef.current = null;
      } else if (e.touches.length === 1) {
        lastTouchPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scale = distance / touchDistanceRef.current;
        touchDistanceRef.current = distance;

        setZoom((prevZoom) => Math.max(0.5, Math.min(20.0, prevZoom * scale)));
      } else if (e.touches.length === 1 && lastTouchPosRef.current) {
        const mode = projectionModeRef.current;
        const deltaX = e.touches[0].clientX - lastTouchPosRef.current.x;
        const deltaY = e.touches[0].clientY - lastTouchPosRef.current.y;
        const sensitivity = 0.2 / zoomRef.current;
        const deltaRA = mode === 'stereographic' ? deltaX * sensitivity : -deltaX * sensitivity;
        const deltaDec = deltaY * sensitivity;

        setViewCenterThrottled((prev) => ({
          ra: (prev.ra + deltaRA + 360) % 360,
          dec: Math.max(-90, Math.min(90, prev.dec + deltaDec)),
        }));

        lastTouchPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchDistanceRef.current = null;
      }
      if (e.touches.length === 0) {
        lastTouchPosRef.current = null;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setViewCenterThrottled]);

  // 星空アニメーション
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (canvasSupportRef.current !== false) {
        canvasSupportRef.current = false;
        onCanvasSupportChange?.(false);
      }
      return;
    }

    if (canvasSupportRef.current !== true) {
      canvasSupportRef.current = true;
      onCanvasSupportChange?.(true);
    }

    const startTime = Date.now();

    const animate = () => {
      const time = Date.now() - startTime;

      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      const visibleCount = drawStars(
        ctx,
        stars,
        viewCenter,
        zoom,
        canvasSize.width,
        canvasSize.height,
        time,
        projectionMode,
        projectionMode === 'stereographic' ? TOKYO_OBSERVER : undefined,
        {
          skipOverlay: false,
          showProperNames: labelOptions.showProperNames,
          showBayerDesignations: labelOptions.showBayerDesignations,
          milkyWayGlow,
        }
      );

      // 星座線を描画
      if (showConstellationLines && constellationLines.length > 0) {
        drawConstellationLines(
          ctx,
          constellationLines,
          starIndex,
          viewCenter,
          zoom,
          canvasSize.width,
          canvasSize.height,
          {
            projectionMode,
            observer: projectionMode === 'stereographic' ? TOKYO_OBSERVER : undefined,
          }
        );
      }

      if (visibleCount !== visibleCountRef.current) {
        visibleCountRef.current = visibleCount;
        onVisibleCountChange?.(visibleCount);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    stars,
    constellationLines,
    starIndex,
    viewCenter,
    zoom,
    canvasSize,
    projectionMode,
    onVisibleCountChange,
    onCanvasSupportChange,
    labelOptions.showProperNames,
    labelOptions.showBayerDesignations,
    showConstellationLines,
    milkyWayGlow,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={className}
      style={{ display: 'block' }}
    />
  );
}
