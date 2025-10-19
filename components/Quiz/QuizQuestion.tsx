import { memo } from 'react';
import type { Quiz } from '@/types/quiz';

interface QuizQuestionProps {
  quiz: Quiz;
}

const QuizQuestionComponent = ({ quiz }: QuizQuestionProps) => (
  <div className="space-y-2 text-white">
    <div className="text-sm uppercase tracking-wide text-blue-200">
      {quiz.type === 'constellation' ? '星座クイズ' : '恒星クイズ'}
    </div>
    <p className="text-lg font-semibold leading-relaxed">{quiz.question}</p>
    {quiz.questionType === 'visual' && (
      <p className="text-xs text-blue-100">※ ビジュアルヒントを参照して答えてください</p>
    )}
  </div>
);

export const QuizQuestion = memo(QuizQuestionComponent);

export default QuizQuestion;
