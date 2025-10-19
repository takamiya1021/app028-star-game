import type { QuizHistoryItem } from '@/context/QuizContext';

interface QuizResultProps {
  result?: QuizHistoryItem;
  onNext: () => void;
}

export function QuizResult({ result, onNext }: QuizResultProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white">
      <div>
        {result ? (
          <>
            <p className="text-sm font-semibold">
              {result.isCorrect ? '正解！' : '残念、不正解。'}
            </p>
            <p className="text-xs text-blue-100 mt-1">
              正解: <span className="font-mono">{result.quiz.correctAnswer}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-blue-100">回答すると結果が表示されます。</p>
        )}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-400"
        data-testid="next-quiz-button"
      >
        次のクイズへ
      </button>
    </div>
  );
}

export default QuizResult;
