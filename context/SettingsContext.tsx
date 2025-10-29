'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Settings } from '@/types/quiz';

type SettingsState = Settings;

type SettingsAction =
  | { type: 'UPDATE'; payload: Partial<SettingsState> }
  | { type: 'RESET' };

const allowedCategories = new Set<SettingsState['category']>(['north', 'south', 'all']);
const allowedDifficulties = new Set<SettingsState['difficulty']>(['easy', 'medium', 'hard']);
const allowedQuestionCounts = new Set<SettingsState['questionCount']>([10, 20, 30, 999]);

const defaultSettings: SettingsState = {
  category: 'all',
  difficulty: 'medium',
  questionCount: 10,
  soundEnabled: true,
  showBayerDesignations: false,
  showProperNames: true,
  showConstellationLines: true,
};

function sanitizeSettings(partial: Partial<SettingsState>): Partial<SettingsState> {
  const next: Partial<SettingsState> = {};

  if (partial.category && allowedCategories.has(partial.category)) {
    next.category = partial.category;
  }

  if (partial.difficulty && allowedDifficulties.has(partial.difficulty)) {
    next.difficulty = partial.difficulty;
  }

  if (partial.questionCount && allowedQuestionCounts.has(partial.questionCount)) {
    next.questionCount = partial.questionCount;
  }

  if (typeof partial.soundEnabled === 'boolean') {
    next.soundEnabled = partial.soundEnabled;
  }

  if (typeof partial.showBayerDesignations === 'boolean') {
    next.showBayerDesignations = partial.showBayerDesignations;
  }

  if (typeof partial.showProperNames === 'boolean') {
    next.showProperNames = partial.showProperNames;
  }

  if (typeof partial.showConstellationLines === 'boolean') {
    next.showConstellationLines = partial.showConstellationLines;
  }

  return next;
}

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'UPDATE':
      return {
        ...state,
        ...sanitizeSettings(action.payload),
      };
    case 'RESET':
      return defaultSettings;
    default:
      return state;
  }
}

interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    updateSettings: (partial) => dispatch({ type: 'UPDATE', payload: partial }),
    resetSettings: () => dispatch({ type: 'RESET' }),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
