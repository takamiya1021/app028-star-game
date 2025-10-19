import { render, screen } from '@testing-library/react';
import { QuizQuestion } from '@/components/Quiz/QuizQuestion';
import type { Quiz } from '@/types/quiz';

const baseQuiz: Quiz = {
  id: 'q1',
  type: 'constellation',
  questionType: 'description',
  question: 'オリオン座はどれ？',
  correctAnswer: 'Orion',
  choices: ['Orion'],
  constellationId: 'Ori',
  difficulty: 'easy',
};

describe('QuizQuestion', () => {
  it('renders question text and label', () => {
    render(<QuizQuestion quiz={baseQuiz} />);
    expect(screen.getByText('星座クイズ')).toBeInTheDocument();
    expect(screen.getByText('オリオン座はどれ？')).toBeInTheDocument();
  });

  it('shows visual hint message when questionType is visual', () => {
    render(<QuizQuestion quiz={{ ...baseQuiz, questionType: 'visual' }} />);
    expect(screen.getByText(/ビジュアルヒントを参照して/)).toBeInTheDocument();
  });
});
