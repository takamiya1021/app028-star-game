import { render, screen, fireEvent } from '@testing-library/react';
import QuizResult from '@/components/Quiz/QuizResult';
import type { QuizHistoryItem } from '@/context/QuizContext';

const sampleQuizHistory = (overrides?: Partial<QuizHistoryItem>): QuizHistoryItem => ({
  quiz: {
    id: 'quiz-1',
    type: 'constellation',
    questionType: 'description',
    question: '「オリオン座」の英語名は？',
    correctAnswer: 'Orion',
    choices: ['Orion', 'Lyra', 'Cassiopeia', 'Cygnus'],
    constellationId: 'Ori',
    difficulty: 'easy',
  },
  answer: 'Orion',
  isCorrect: true,
  ...overrides,
});

describe('QuizResult', () => {
  it('shows fallback message when no result is available', () => {
    const onNext = jest.fn();
    render(<QuizResult onNext={onNext} />);
    expect(screen.getByText('回答すると結果が表示されます。')).toBeInTheDocument();
  });

  it('displays correct result information', () => {
    const onNext = jest.fn();
    render(<QuizResult result={sampleQuizHistory()} onNext={onNext} />);
    expect(screen.getByText('正解！')).toBeInTheDocument();
    expect(screen.getByText(/正解:/)).toHaveTextContent('正解: Orion');
  });

  it('displays incorrect result message', () => {
    const onNext = jest.fn();
    const incorrect = sampleQuizHistory({ answer: 'Lyra', isCorrect: false });
    render(<QuizResult result={incorrect} onNext={onNext} />);
    expect(screen.getByText('残念、不正解。')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(<QuizResult result={sampleQuizHistory()} onNext={onNext} />);
    fireEvent.click(screen.getByTestId('next-quiz-button'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
