'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateQuiz } from '@/lib/data/quizGenerator';
import { useQuiz } from '@/context/QuizContext';
import { useSettings } from '@/context/SettingsContext';
import QuizQuestion from './QuizQuestion';
import QuizChoices from './QuizChoices';
import QuizResult from './QuizResult';
import { FadeIn } from '@/components/Animate/FadeIn';
import type { Quiz, QuizType } from '@/types/quiz';

export function QuizContainer() {
  const { settings } = useSettings();
  const {
    currentQuiz,
    setNewQuiz,
    submitAnswer,
    history,
    correctCount,
    totalCount,
  } = useQuiz();

  const [status, setStatus] = useState<'loading' | 'ready' | 'answered' | 'error'>('loading');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const lastQuizTypeRef = useRef<QuizType | undefined>();

  const lastResult = useMemo(() => history[history.length - 1], [history]);

  // currentQuizが変わったらlastQuizTypeRefを更新
  useEffect(() => {
    if (currentQuiz) {
      lastQuizTypeRef.current = currentQuiz.type;
    }
  }, [currentQuiz]);

  const loadQuiz = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setStatus('loading');
    setErrorMessage(null);
    setSelectedChoice(null);
    try {
      const forcedQuizQueue =
        typeof window !== 'undefined' && Array.isArray((window as typeof window & { __E2E_QUIZ_QUEUE__?: Quiz[] }).__E2E_QUIZ_QUEUE__)
          ? (window as typeof window & { __E2E_QUIZ_QUEUE__?: Quiz[] }).__E2E_QUIZ_QUEUE__
          : undefined;
      let forcedQuiz =
        typeof window !== 'undefined' && '__E2E_QUIZ__' in window
          ? (window as typeof window & { __E2E_QUIZ__?: Quiz }).__E2E_QUIZ__
          : undefined;
      if (!forcedQuiz && forcedQuizQueue?.length) {
        forcedQuiz = forcedQuizQueue.shift();
      }
      if (forcedQuiz && typeof window !== 'undefined' && '__E2E_QUIZ__' in window) {
        delete (window as typeof window & { __E2E_QUIZ__?: Quiz }).__E2E_QUIZ__;
      }

      const quiz = forcedQuiz
        ? forcedQuiz
        : await generateQuiz({
            difficulty: settings.difficulty,
            category: settings.category,
            lastQuizType: lastQuizTypeRef.current,
          });
      if (!isMountedRef.current) return;
      setNewQuiz(quiz);
      setStatus('ready');
    } catch (error) {
      console.error(error);
      if (!isMountedRef.current) return;
      setErrorMessage('クイズの取得に失敗しました');
      setStatus('error');
    } finally {
      isFetchingRef.current = false;
    }
  }, [settings.category, settings.difficulty, setNewQuiz]);

  useEffect(() => {
    isMountedRef.current = true;
    loadQuiz();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadQuiz]);

  const handleSelect = useCallback(
    (choice: string) => {
      if (!currentQuiz || status !== 'ready') return;
      submitAnswer(choice);
      setSelectedChoice(choice);
      setStatus('answered');
    },
    [currentQuiz, status, submitAnswer]
  );

  const handleNextQuiz = useCallback(() => {
    if (status === 'loading') return;
    loadQuiz();
  }, [loadQuiz, status]);

  return (
    <FadeIn
      className="pointer-events-auto space-y-3 rounded-xl border border-white/10 bg-black/40 p-3 shadow-lg sm:space-y-6 sm:p-6"
      data-testid="quiz-container"
    >
      {/* デスクトップのみスコア表示 */}
      <header className="hidden sm:flex items-center gap-2 text-white">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: `${totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-blue-200 whitespace-nowrap">
          {correctCount}/{totalCount}
        </span>
      </header>

      {/* デスクトップのみローディング表示 */}
      {status === 'loading' && (
        <p className="hidden sm:block text-sm text-blue-100">クイズを読み込み中...</p>
      )}

      {/* デスクトップのみエラー表示 */}
      {status === 'error' && (
        <div className="hidden sm:block rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
          {errorMessage ?? 'エラーが発生しました。再試行してください。'}
        </div>
      )}

      {currentQuiz && status !== 'loading' && (
        <div className="space-y-3 sm:space-y-6">
          {/* 質問文表示（全画面） */}
          <QuizQuestion quiz={currentQuiz} />

          {/* ヒント表示（全画面） */}
          {currentQuiz.type === 'find-star' && (
            <p className="text-xs text-blue-200 sm:text-sm">
              💡 星空をクリック/タップして、対象の星を探してください
            </p>
          )}

          {/* 選択肢型クイズの場合のみQuizChoicesを表示 */}
          {currentQuiz.questionType !== 'interactive' && (
            <QuizChoices
              choices={currentQuiz.choices}
              disabled={status === 'answered'}
              selected={selectedChoice}
              onSelect={handleSelect}
            />
          )}
        </div>
      )}

      <QuizResult result={lastResult} onNext={handleNextQuiz} />
    </FadeIn>
  );
}

export default QuizContainer;
