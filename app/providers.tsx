'use client';

import { QuizProvider } from '@/context/QuizContext';
import { SettingsProvider } from '@/context/SettingsContext';
import AppErrorBoundary from '@/components/ErrorBoundary/AppErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <QuizProvider>
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </QuizProvider>
    </SettingsProvider>
  );
}

export default Providers;
