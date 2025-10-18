'use client';

import { useState, useMemo } from 'react';
import StarField from '@/components/StarField/StarField';
import { ProjectionMode } from '@/lib/canvas/coordinateUtils';
import { ObservationMode, OBSERVATION_MODE_LABELS, OBSERVATION_MODE_DESCRIPTIONS, OBSERVATION_MODE_ICONS } from '@/types/observationMode';
import starsData from '@/public/data/stars.json';

export default function Home() {
  const [visibleStarCount, setVisibleStarCount] = useState(0);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('orthographic');
  const [observationMode, setObservationMode] = useState<ObservationMode>('naked-eye');

  // 観測モードに応じて星データをフィルタリング
  const stars = useMemo(() => {
    if (observationMode === 'naked-eye') {
      // 肉眼観測モード: 7等星まで
      return starsData.filter((star: any) => star.vmag !== null && star.vmag < 7);
    } else {
      // 天の川モード: 9等星まで（全データ）
      return starsData;
    }
  }, [observationMode]);

  const toggleProjection = () => {
    setProjectionMode(prev => prev === 'orthographic' ? 'stereographic' : 'orthographic');
  };

  const toggleObservationMode = () => {
    setObservationMode(prev => prev === 'naked-eye' ? 'telescope' : 'naked-eye');
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <StarField
        stars={stars}
        viewCenter={{ ra: 90, dec: 0 }}
        zoom={2.0}
        className="w-full h-full"
        onVisibleCountChange={setVisibleStarCount}
        projectionMode={projectionMode}
      />

      {/* タイトル */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          ✨ Stellarium Quiz ✨
        </h1>
      </div>

      {/* 視点切り替えボタン */}
      <button
        onClick={toggleProjection}
        className="absolute top-8 right-8 px-4 py-2 bg-blue-600/80 hover:bg-blue-500/90 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 flex flex-col items-start gap-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {projectionMode === 'orthographic' ? '🌍' : '🔭'}
          </span>
          <span className="text-sm font-medium">
            現在: {projectionMode === 'orthographic' ? '宇宙シミュレーター' : 'プラネタリウム'}
          </span>
        </div>
      </button>

      {/* 観測モード切り替えトグルスイッチ */}
      <div className="absolute top-24 right-8 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-medium">観測モード</span>
          <button
            onClick={toggleObservationMode}
            className="relative w-16 h-8 bg-gray-700 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${
                observationMode === 'milky-way' ? 'translate-x-8' : ''
              }`}
            >
              <span className="text-xs">
                {OBSERVATION_MODE_ICONS[observationMode]}
              </span>
            </div>
          </button>
          <div className="flex flex-col">
            <span className="text-sm text-white font-medium">
              {OBSERVATION_MODE_LABELS[observationMode]}
            </span>
            <span className="text-xs text-gray-400">
              {OBSERVATION_MODE_DESCRIPTIONS[observationMode]}
            </span>
          </div>
        </div>
      </div>

      {/* 星の数表示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-lg font-semibold mb-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          星空を眺めてみよう
        </p>
        <p className="text-sm text-blue-200 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {visibleStarCount}個の星が輝いています
        </p>
      </div>
    </main>
  );
}
