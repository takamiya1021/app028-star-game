'use client';

'use client';

import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { FadeIn } from '@/components/Animate/FadeIn';
import type { Settings } from '@/types/quiz';
const CATEGORY_OPTIONS = [
  { value: 'all' as const, label: '全天' },
  { value: 'north' as const, label: '北天' },
  { value: 'south' as const, label: '南天' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy' as const, label: '初級' },
  { value: 'medium' as const, label: '中級' },
  { value: 'hard' as const, label: '上級' },
];

const QUESTION_COUNT_OPTIONS = [
  { value: 10 as const, label: '10問' },
  { value: 20 as const, label: '20問' },
  { value: 30 as const, label: '30問' },
  { value: 999 as const, label: '無制限' },
];

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleCategoryChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ category: event.target.value as Settings['category'] });
  }, [updateSettings]);

  const handleDifficultyChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ difficulty: event.target.value as Settings['difficulty'] });
  }, [updateSettings]);

  const handleQuestionCountChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ questionCount: Number(event.target.value) as Settings['questionCount'] });
  }, [updateSettings]);

  const handleSoundToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateSettings({ soundEnabled: event.target.checked });
    },
    [updateSettings]
  );

  return (
    <FadeIn as="section" className="space-y-6 rounded-xl border border-white/10 bg-black/50 p-6 text-white shadow-lg" data-motion="fade-in-settings">
      <header>
        <h2 className="text-xl font-bold">クイズ設定</h2>
        <p className="text-sm text-blue-200">好みに合わせて出題内容を調整できます。</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2" role="group" aria-label="クイズ設定コントロール">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-blue-100">観測エリア</span>
          <select
            value={settings.category}
            onChange={handleCategoryChange}
            className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            aria-label="観測エリア"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-blue-100">難易度</span>
          <select
            value={settings.difficulty}
            onChange={handleDifficultyChange}
            className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            aria-label="難易度"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-blue-100">出題数</span>
          <select
            value={String(settings.questionCount)}
            onChange={handleQuestionCountChange}
            className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            aria-label="出題数"
          >
            {QUESTION_COUNT_OPTIONS.map((option) => (
              <option key={option.value} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <span className="font-semibold text-blue-100">効果音を有効にする</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={handleSoundToggle}
            className="h-5 w-5 accent-blue-400"
            aria-label="効果音を有効にする"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetSettings}
          className="rounded-md border border-white/20 px-4 py-2 text-sm text-blue-100 transition hover:border-blue-300 hover:text-white"
        >
          初期設定に戻す
        </button>
      </div>
    </FadeIn>
  );
}

export default SettingsPanel;
