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
      className="space-y-6 rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg"
      data-testid="quiz-container"
    >
      <header className="flex items-baseline justify-between text-white">
        <h2 className="text-xl font-bold">星空クイズ</h2>
        <div className="text-sm text-blue-200">
          スコア: {correctCount}/{totalCount}
        </div>
      </header>

      {status === 'loading' && (
        <p className="text-sm text-blue-100">クイズを読み込み中...</p>
      )}

      {status === 'error' && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
          {errorMessage ?? 'エラーが発生しました。再試行してください。'}
        </div>
      )}

      {currentQuiz && status !== 'loading' && (
        <div className="space-y-6">
          <QuizQuestion quiz={currentQuiz} />

          {/* クイズタイプ別の説明 */}
          {currentQuiz.type === 'find-star' && (
            <p className="text-sm text-blue-200">
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
