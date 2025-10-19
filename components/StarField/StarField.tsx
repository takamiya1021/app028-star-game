'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Star } from '@/types/star';
import { ProjectionMode, ObserverLocation } from '@/lib/canvas/coordinateUtils';
import { drawStars } from '@/lib/canvas/starRenderer';

interface StarFieldProps {
  stars: Star[];
  viewCenter?: { ra: number; dec: number };
  zoom?: number;
  className?: string;
  onVisibleCountChange?: (count: number) => void;
  projectionMode?: ProjectionMode;
}

// 東京の位置と観測日時（2025年1月1日 00:00:00 JST = 2024年12月31日 15:00:00 UTC）
const TOKYO_OBSERVER: ObserverLocation = {
  latitude: 35.7,
  longitude: 139.7,
  date: new Date('2024-12-31T15:00:00Z'), // UTC
};

export default function StarField({
  stars,
  viewCenter: initialViewCenter = { ra: 180, dec: 0 },
  zoom: initialZoom = 1.5,
  className = '',
  onVisibleCountChange,
  projectionMode = 'orthographic',
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(initialZoom);
  const [viewCenter, setViewCenter] = useState(initialViewCenter);
  const animationRef = useRef<number>();
  const visibleCountRef = useRef<number>(0);

  const touchDistanceRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const zoomRef = useRef(initialZoom);
  const projectionModeRef = useRef(projectionMode);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    projectionModeRef.current = projectionMode;
  }, [projectionMode]);

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
      return Math.max(0.5, Math.min(10.0, next));
    });
  }, []);

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

    setViewCenter((prev) => ({
      ra: (prev.ra + deltaRA + 360) % 360,
      dec: Math.max(-90, Math.min(90, prev.dec + deltaDec)),
    }));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = 'grab';
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);

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

        setZoom((prevZoom) => Math.max(0.5, Math.min(10.0, prevZoom * scale)));
      } else if (e.touches.length === 1 && lastTouchPosRef.current) {
        const deltaX = e.touches[0].clientX - lastTouchPosRef.current.x;
        const deltaY = e.touches[0].clientY - lastTouchPosRef.current.y;
        const sensitivity = 0.2 / zoomRef.current;
        const deltaRA = deltaX * sensitivity;
        const deltaDec = deltaY * sensitivity;

        setViewCenter((prev) => ({
          ra: (prev.ra - deltaRA + 360) % 360,
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
  }, []);

  // 星空アニメーション
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
          skipOverlay: stars.length > 60000,
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
  }, [stars, viewCenter, zoom, canvasSize, projectionMode, onVisibleCountChange]);

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
