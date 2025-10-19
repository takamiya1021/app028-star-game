import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { QuizProvider, useQuiz } from '@/context/QuizContext';

describe('QuizContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QuizProvider>{children}</QuizProvider>
  );

  it('initializes with default state', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    expect(result.current.currentQuiz).toBeNull();
    expect(result.current.correctCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('sets new quiz and updates counters', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => {
      result.current.setNewQuiz({
        id: 'quiz-1',
        type: 'constellation',
        questionType: 'description',
        question: 'オリオン座はどれ？',
        correctAnswer: 'Orion',
        choices: ['Ursa Major', 'Orion', 'Crux', 'Scorpius'],
        constellationId: 'Ori',
        difficulty: 'easy',
      });
    });

    expect(result.current.currentQuiz?.id).toBe('quiz-1');
    expect(result.current.totalCount).toBe(1);

    act(() => {
      result.current.submitAnswer('Orion');
    });

    expect(result.current.correctCount).toBe(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].isCorrect).toBe(true);
  });

  it('handles incorrect answers', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => {
      result.current.setNewQuiz({
        id: 'quiz-2',
        type: 'star',
        questionType: 'description',
        question: 'ベテルギウスを選んでください',
        correctAnswer: 'ベテルギウス',
        choices: ['ドゥベ', 'ベテルギウス', 'アルタイル', 'スピカ'],
        starId: 1,
        difficulty: 'medium',
      });
    });

    act(() => {
      result.current.submitAnswer('アルタイル');
    });

    expect(result.current.correctCount).toBe(0);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.history[0].isCorrect).toBe(false);
  });

  it('resets quiz state', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => {
      result.current.setNewQuiz({
        id: 'quiz-3',
        type: 'constellation',
        questionType: 'description',
        question: 'おおぐま座はどれ？',
        correctAnswer: 'Ursa Major',
        choices: ['Ursa Major', 'Crux', 'Centaurus', 'Pegasus'],
        constellationId: 'UMa',
        difficulty: 'medium',
      });
      result.current.submitAnswer('Crux');
    });

    expect(result.current.history).toHaveLength(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentQuiz).toBeNull();
    expect(result.current.history).toHaveLength(0);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });
});
