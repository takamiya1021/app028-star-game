'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateQuiz } from '@/lib/data/quizGenerator';
import { useQuiz } from '@/context/QuizContext';
import { useSettings } from '@/context/SettingsContext';
import QuizQuestion from './QuizQuestion';
import QuizChoices from './QuizChoices';
import QuizResult from './QuizResult';

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

  const lastResult = useMemo(() => history[history.length - 1], [history]);

  const loadQuiz = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setStatus('loading');
    setErrorMessage(null);
    setSelectedChoice(null);
    try {
      const quiz = await generateQuiz({
        difficulty: settings.difficulty,
        category: settings.category,
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
    <div className="space-y-6 rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg">
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
          <QuizChoices
            choices={currentQuiz.choices}
            disabled={status === 'answered'}
            selected={selectedChoice}
            onSelect={handleSelect}
          />
        </div>
      )}

      <QuizResult result={lastResult} onNext={handleNextQuiz} />
    </div>
  );
}

export default QuizContainer;
