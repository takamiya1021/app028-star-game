'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Settings } from '@/types/quiz';

type SettingsState = Settings;

type SettingsAction =
  | { type: 'UPDATE'; payload: Partial<SettingsState> }
  | { type: 'RESET' };

const defaultSettings: SettingsState = {
  category: 'all',
  difficulty: 'medium',
  questionCount: 10,
  soundEnabled: true,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, ...action.payload };
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
