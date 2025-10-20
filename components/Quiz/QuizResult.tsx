import { memo } from 'react';
import type { QuizHistoryItem } from '@/context/QuizContext';

interface QuizResultProps {
  result?: QuizHistoryItem;
  onNext: () => void;
}

const QuizResultComponent = ({ result, onNext }: QuizResultProps) => (
  <div className="space-y-2 sm:space-y-3">
    {result ? (
      <div className="space-y-2">
        {/* 正解/不正解表示（全画面） */}
        <div className="rounded-md border border-white/10 bg-white/5 px-2 py-2 text-white sm:px-4 sm:py-3">
          <p className="text-xs font-semibold sm:text-sm">
            {result.isCorrect ? '✅ 正解！' : '❌ 残念、不正解。'}
          </p>
          <p className="text-[10px] text-blue-100 mt-0.5 sm:text-xs sm:mt-1">
            正解: <span className="font-mono">{result.quiz.correctAnswer}</span>
          </p>

          {/* 解説表示（全画面） */}
          {result.quiz.explanation && (
            <div className="mt-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-2 sm:mt-3 sm:p-3">
              <p className="text-[10px] text-blue-100 leading-relaxed sm:text-xs">
                💡 {result.quiz.explanation}
              </p>
            </div>
          )}
        </div>

        {/* 次へボタン */}
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-md bg-blue-500 px-2 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-400 sm:px-4 sm:py-2 sm:text-sm"
          data-testid="next-quiz-button"
        >
          次へ
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-md bg-blue-500 px-2 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-400 sm:px-4 sm:py-2 sm:text-sm"
        data-testid="next-quiz-button"
      >
        次へ
      </button>
    )}
  </div>
);

export const QuizResult = memo(QuizResultComponent);

export default QuizResult;
