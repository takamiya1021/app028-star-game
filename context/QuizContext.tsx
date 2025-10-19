'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Quiz } from '@/types/quiz';

interface QuizHistoryItem {
  quiz: Quiz;
  answer: string;
  isCorrect: boolean;
}

interface QuizState {
  currentQuiz: Quiz | null;
  history: QuizHistoryItem[];
  correctCount: number;
  totalCount: number;
}

const initialState: QuizState = {
  currentQuiz: null,
  history: [],
  correctCount: 0,
  totalCount: 0,
};

type Action =
  | { type: 'SET_NEW_QUIZ'; quiz: Quiz }
  | { type: 'SUBMIT_ANSWER'; answer: string }
  | { type: 'RESET' };

function quizReducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'SET_NEW_QUIZ':
      return {
        ...state,
        currentQuiz: action.quiz,
        totalCount: state.totalCount + 1,
      };
    case 'SUBMIT_ANSWER':
      if (!state.currentQuiz) return state;
      const isCorrect = state.currentQuiz.correctAnswer === action.answer;
      return {
        ...state,
        currentQuiz: null,
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        history: [
          ...state.history,
          {
            quiz: state.currentQuiz,
            answer: action.answer,
            isCorrect,
          },
        ],
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface QuizContextValue extends QuizState {
  setNewQuiz: (quiz: Quiz) => void;
  submitAnswer: (answer: string) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const value = useMemo<QuizContextValue>(() => ({
    ...state,
    setNewQuiz: (quiz) => dispatch({ type: 'SET_NEW_QUIZ', quiz }),
    submitAnswer: (answer) => dispatch({ type: 'SUBMIT_ANSWER', answer }),
    reset: () => dispatch({ type: 'RESET' }),
  }), [state]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return ctx;
}
