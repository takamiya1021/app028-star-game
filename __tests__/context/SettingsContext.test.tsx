import { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext', () => {
  it('provides default settings', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.category).toBe('all');
    expect(result.current.settings.difficulty).toBe('medium');
    expect(result.current.settings.questionCount).toBe(10);
    expect(result.current.settings.soundEnabled).toBe(true);
  });

  it('updates individual settings fields', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ category: 'south' });
    });
    expect(result.current.settings.category).toBe('south');

    act(() => {
      result.current.updateSettings({ difficulty: 'hard' });
    });
    expect(result.current.settings.difficulty).toBe('hard');

    act(() => {
      result.current.updateSettings({ questionCount: 20 });
    });
    expect(result.current.settings.questionCount).toBe(20);

    act(() => {
      result.current.updateSettings({ soundEnabled: false });
    });
    expect(result.current.settings.soundEnabled).toBe(false);
  });

  it('resets to defaults', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ category: 'north', soundEnabled: false });
    });
    expect(result.current.settings.category).toBe('north');
    expect(result.current.settings.soundEnabled).toBe(false);

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings).toEqual({
      category: 'all',
      difficulty: 'medium',
      questionCount: 10,
      soundEnabled: true,
    });
  });
});
