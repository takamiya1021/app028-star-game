'use client';

import { useEffect } from 'react';
import ErrorFallback from '@/components/ErrorBoundary/ErrorFallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary', error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-900 to-indigo-950 p-6">
        <ErrorFallback
          onRetry={reset}
          description="一時的な障害が発生しました。再読み込みで復旧する場合があります。"
          supportContent={
            <p className="text-xs text-red-100">
              状況が改善しない場合は時間をおいてからアクセスしてください。
            </p>
          }
        />
      </body>
    </html>
  );
}
