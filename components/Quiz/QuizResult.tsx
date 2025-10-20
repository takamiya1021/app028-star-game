import { memo } from 'react';
import type { QuizHistoryItem } from '@/context/QuizContext';

interface QuizResultProps {
  result?: QuizHistoryItem;
  onNext: () => void;
}

const QuizResultComponent = ({ result, onNext }: QuizResultProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white">
      <div className="flex-1 pr-4">
        {result ? (
          <>
            <p className="text-sm font-semibold">
              {result.isCorrect ? '✅ 正解！' : '❌ 残念、不正解。'}
            </p>
            <p className="text-xs text-blue-100 mt-1">
              正解: <span className="font-mono">{result.quiz.correctAnswer}</span>
            </p>

            {/* 解説表示 */}
            {result.quiz.explanation && (
              <div className="mt-3 rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-xs text-blue-100 leading-relaxed">
                  💡 {result.quiz.explanation}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-blue-100">回答すると結果が表示されます。</p>
        )}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-400 whitespace-nowrap"
        data-testid="next-quiz-button"
      >
        次のクイズへ
      </button>
    </div>
  </div>
);

export const QuizResult = memo(QuizResultComponent);

export default QuizResult;
