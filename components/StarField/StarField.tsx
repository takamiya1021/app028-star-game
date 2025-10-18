'use client';

import { useEffect, useRef, useState } from 'react';
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
  viewCenter: initialViewCenter = { ra: 180, dec: 0 }, // デフォルト：全天の中心
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

  // ピンチ操作用の状態
  const touchDistanceRef = useRef<number | null>(null);

  // ドラッグ操作用の状態
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // キャンバスサイズ調整
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          setCanvasSize({
            width: container.clientWidth,
            height: container.clientHeight,
          });
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // マウスホイールでズーム
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      setZoom((prevZoom) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1; // ホイール下で縮小、上で拡大
        const newZoom = prevZoom + delta;
        return Math.max(0.5, Math.min(10.0, newZoom)); // 0.5倍〜10.0倍に制限
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // マウスドラッグで視野移動
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !lastMousePosRef.current) return;

      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;

      // ドラッグの移動量を視野の移動に変換
      const sensitivity = 0.2 / zoom; // ズームが大きいほど感度を下げる

      // プラネタリウム（球の内側）= 基準座標系（星データそのまま）
      // 宇宙シミュレーター（球の外側）= 鏡像（左右のみ反転）
      let deltaRA: number;
      let deltaDec: number;

      if (projectionMode === 'stereographic') {
        // プラネタリウム：基準座標系
        deltaRA = deltaX * sensitivity;
        deltaDec = deltaY * sensitivity;
      } else {
        // 宇宙シミュレーター：鏡像（左右反転、上下そのまま）
        deltaRA = -deltaX * sensitivity;  // 左右反転
        deltaDec = deltaY * sensitivity;   // 上下そのまま
      }

      setViewCenter((prev) => ({
        ra: (prev.ra + deltaRA + 360) % 360, // 0〜360度でループ
        dec: Math.max(-90, Math.min(90, prev.dec + deltaDec)), // -90〜90度に制限
      }));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      lastMousePosRef.current = null;
      canvas.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      lastMousePosRef.current = null;
      canvas.style.cursor = 'grab';
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [zoom, projectionMode]);

  // タッチ操作でピンチズーム & スワイプ移動
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lastTouchPosRef = { current: null as { x: number; y: number } | null };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // 2本指の距離を計算（ピンチズーム）
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        touchDistanceRef.current = distance;
        lastTouchPosRef.current = null; // スワイプ位置をリセット
      } else if (e.touches.length === 1) {
        // 1本指でスワイプ移動
        lastTouchPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        // 2本指ピンチズーム
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scale = distance / touchDistanceRef.current;

        setZoom((prevZoom) => {
          const newZoom = prevZoom * scale;
          touchDistanceRef.current = distance;
          return Math.max(0.5, Math.min(10.0, newZoom));
        });
      } else if (e.touches.length === 1 && lastTouchPosRef.current) {
        // 1本指スワイプ移動
        e.preventDefault();

        const deltaX = e.touches[0].clientX - lastTouchPosRef.current.x;
        const deltaY = e.touches[0].clientY - lastTouchPosRef.current.y;

        const sensitivity = 0.2 / zoom;

        // プラネタリウム（球の内側）= 基準座標系（星データそのまま）
        // 宇宙シミュレーター（球の外側）= 鏡像（左右のみ反転）
        let deltaRA: number;
        let deltaDec: number;

        if (projectionMode === 'stereographic') {
          // プラネタリウム：基準座標系
          deltaRA = deltaX * sensitivity;
          deltaDec = deltaY * sensitivity;
        } else {
          // 宇宙シミュレーター：鏡像（左右反転、上下そのまま）
          deltaRA = -deltaX * sensitivity;  // 左右反転
          deltaDec = deltaY * sensitivity;   // 上下そのまま
        }

        setViewCenter((prev) => ({
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
  }, [zoom, projectionMode]);

  // 星空アニメーション
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = Date.now();

    const animate = () => {
      const time = Date.now() - startTime;

      // キャンバスクリア
      ctx.fillStyle = '#000814'; // 深い青黒
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // 星を描画
      const visibleCount = drawStars(
        ctx,
        stars,
        viewCenter,
        zoom,
        canvasSize.width,
        canvasSize.height,
        time,
        projectionMode,
        projectionMode === 'stereographic' ? TOKYO_OBSERVER : undefined
      );

      // 表示された星の数が変わったら親に通知
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
  }, [stars, viewCenter, zoom, canvasSize, projectionMode]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={`${className}`}
      style={{ display: 'block' }}
    />
  );
}
