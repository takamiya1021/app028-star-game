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
    reset,
  } = useQuiz();

  const [status, setStatus] = useState<'loading' | 'ready' | 'answered' | 'error' | 'idle'>('idle');
  const [selectedChoice, setSelectedChoice] = useState<{ quizId: string; choice: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const lastQuizTypeRef = useRef<QuizType | undefined>();
  const ignoreResultRef = useRef(false);

  const lastResult = useMemo(() => history[history.length - 1], [history]);

  // currentQuizが変わったらlastQuizTypeRefを更新
  useEffect(() => {
    if (currentQuiz) {
      lastQuizTypeRef.current = currentQuiz.type;
    }
  }, [currentQuiz]);

  useEffect(() => {
    if (!currentQuiz && !isFetchingRef.current && (status === 'ready' || status === 'answered')) {
      setStatus('idle');
    }
  }, [currentQuiz, status]);

  // 回答が追加されたら自動的にstatusを'answered'に変更（find-starクイズ対応）
  useEffect(() => {
    if (lastResult && status === 'ready' && currentQuiz && lastResult.quiz.id === currentQuiz.id) {
      setStatus('answered');
    }
  }, [lastResult, status, currentQuiz]);

  // クイズが変わったらselectedChoiceをリセット
  useEffect(() => {
    if (currentQuiz) {
      setSelectedChoice(null);
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
      if (ignoreResultRef.current) {
        ignoreResultRef.current = false;
        setStatus('idle');
        return;
      }
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
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelect = useCallback(
    (choice: string) => {
      if (!currentQuiz || status !== 'ready') return;
      submitAnswer(choice);
      setSelectedChoice({ quizId: currentQuiz.id, choice });
      setStatus('answered');
    },
    [currentQuiz, status, submitAnswer]
  );

  const handleNextQuiz = useCallback(() => {
    if (status === 'loading') return;
    setSelectedChoice(null);
    loadQuiz();
  }, [loadQuiz, status]);

  const handleQuit = useCallback(() => {
    ignoreResultRef.current = isFetchingRef.current;
    reset();
    setSelectedChoice(null);
    setStatus('idle');
    isFetchingRef.current = false;
  }, [reset]);

  return (
    <FadeIn
      className="pointer-events-auto space-y-3 rounded-xl border border-white/10 bg-black/40 p-3 shadow-lg sm:space-y-6 sm:p-6"
      data-testid="quiz-container"
    >
      {/* スコアバー（デスクトップのみ） */}
      <div className="hidden xl:flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: `${Math.round((correctCount / 10) * 100)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-blue-200 whitespace-nowrap">
          {correctCount}/10
        </span>
      </div>

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

      {status === 'idle' && (
        <div className="space-y-3 rounded-md border border-white/15 bg-white/5 p-3 text-sm text-blue-100">
          <p className="font-semibold text-white">クイズは終了しました。</p>
          <p>「新しいクイズを始める」を押すと、いつでも再開できます。</p>
          <button
            type="button"
            onClick={() => loadQuiz()}
            className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            新しいクイズを始める
          </button>
        </div>
      )}

          {currentQuiz && status !== 'loading' && status !== 'error' && (
            <div className="space-y-3 sm:space-y-6">
              {/* 質問文表示（全画面） */}
              <QuizQuestion quiz={currentQuiz} />

              {/* ヒント表示（全画面） */}
              {currentQuiz.type === 'find-star' && (
                <p className="text-xs text-blue-200 sm:text-sm">
                  💡 星空をクリック/タップして、対象の星を探してください
                </p>
              )}

              {/* 選択肢型クイズの場合のみQuizChoicesを表示（answered状態では非表示） */}
              {currentQuiz.questionType !== 'interactive' && status === 'ready' && (
                <QuizChoices
                  key={currentQuiz.id}
                  choices={currentQuiz.choices}
                  disabled={false}
                  selected={selectedChoice?.quizId === currentQuiz.id ? selectedChoice.choice : null}
                  onSelect={handleSelect}
                />
              )}
            </div>
          )}

      {/* 回答後のみ結果表示 */}
      {status === 'answered' && <QuizResult result={lastResult} onNext={handleNextQuiz} />}

      {(status === 'ready' || status === 'answered' || status === 'loading') && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleQuit}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed"
            disabled={status === 'loading'}
          >
            クイズを終了
          </button>
        </div>
      )}
    </FadeIn>
  );
}

export default QuizContainer;
