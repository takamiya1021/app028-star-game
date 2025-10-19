'use client';

import { QuizProvider } from '@/context/QuizContext';
import { SettingsProvider } from '@/context/SettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <QuizProvider>{children}</QuizProvider>
    </SettingsProvider>
  );
}

export default Providers;
