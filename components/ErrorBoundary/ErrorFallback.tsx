'use client';

import type { ReactNode } from 'react';

interface ErrorFallbackProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  supportContent?: ReactNode;
}

export function ErrorFallback({
  title = '予期せぬエラーが発生しました',
  description = 'ページを再読み込みしてやり直してください。',
  onRetry,
  actionLabel = '再読み込み',
  supportContent,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col gap-3 rounded-3xl border border-red-500/40 bg-red-500/15 px-6 py-6 text-center text-white shadow-2xl backdrop-blur"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-red-100">{description}</p>
      {supportContent}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default ErrorFallback;
