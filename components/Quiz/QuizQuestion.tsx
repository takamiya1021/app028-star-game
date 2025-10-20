import { memo } from 'react';
import type { Quiz } from '@/types/quiz';

interface QuizQuestionProps {
  quiz: Quiz;
}

const QuizQuestionComponent = ({ quiz }: QuizQuestionProps) => (
  <div className="space-y-1 text-white sm:space-y-2">
    <div className="text-xs uppercase tracking-wide text-blue-200 sm:text-sm">
      {quiz.type === 'constellation' ? '星座クイズ' : '恒星クイズ'}
    </div>
    <p className="text-sm font-semibold leading-relaxed sm:text-lg">{quiz.question}</p>
    {quiz.questionType === 'visual' && (
      <p className="text-[10px] text-blue-100 sm:text-xs">※ ビジュアルヒントを参照して答えてください</p>
    )}
  </div>
);

export const QuizQuestion = memo(QuizQuestionComponent);

export default QuizQuestion;
