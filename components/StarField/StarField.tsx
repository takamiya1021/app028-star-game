'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star } from '@/types/star';
import { ProjectionMode, ObserverLocation, celestialToScreen } from '@/lib/canvas/coordinateUtils';
import { drawStars } from '@/lib/canvas/starRenderer';

interface StarFieldProps {
  stars: Star[];
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
  milkyWayGlow?: 'telescope' | 'naked-eye' | false;
  quizTarget?: {
    viewCenter: { ra: number; dec: number };
    zoomLevel: number;
  } | null;
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
  viewCenter: initialViewCenter = { ra: 180, dec: 0 },
  zoom: initialZoom = 1.5,
  className = '',
  onVisibleCountChange,
  projectionMode = 'orthographic',
  onCanvasSupportChange,
  labelPreferences,
  milkyWayGlow = 'telescope',
  quizTarget,
  onStarClick,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(initialZoom);
  const [viewCenter, setViewCenter] = useState(initialViewCenter);
  const animationRef = useRef<number>();
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

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    projectionModeRef.current = projectionMode;
  }, [projectionMode]);

  // クイズターゲットへの自動移動（スムーズアニメーション）
  useEffect(() => {
    if (!quizTarget) return;

    const targetViewCenter = quizTarget.viewCenter;
    const targetZoom = quizTarget.zoomLevel;
    const duration = 1000; // 1秒でアニメーション
    const startTime = Date.now();

    // アニメーション開始時点のviewCenterとzoomを意図的にキャプチャ
    const startViewCenter = { ...viewCenter };
    const startZoom = zoom;

    // イージング関数（ease-in-out）
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      // 赤経の補間（360度の折り返しを考慮）
      let raDiff = targetViewCenter.ra - startViewCenter.ra;
      if (raDiff > 180) raDiff -= 360;
      if (raDiff < -180) raDiff += 360;
      const newRA = (startViewCenter.ra + raDiff * easedProgress + 360) % 360;

      // 赤緯とズームの補間
      const newDec = startViewCenter.dec + (targetViewCenter.dec - startViewCenter.dec) * easedProgress;
      const newZoom = startZoom + (targetZoom - startZoom) * easedProgress;

      setViewCenter({ ra: newRA, dec: newDec });
      setZoom(newZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizTarget]);

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
    viewCenter,
    zoom,
    canvasSize,
    projectionMode,
    onVisibleCountChange,
    onCanvasSupportChange,
    labelOptions.showProperNames,
    labelOptions.showBayerDesignations,
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
