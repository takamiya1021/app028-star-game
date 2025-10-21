'use client';

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { Quiz } from '@/types/quiz';

export interface QuizHistoryItem {
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
      };
    case 'SUBMIT_ANSWER':
      if (!state.currentQuiz) return state;
      const isCorrect = state.currentQuiz.correctAnswer === action.answer;
      return {
        ...state,
        correctCount: isCorrect
          ? state.correctCount + 1
          : Math.max(0, state.correctCount - 1),
        totalCount: state.totalCount + 1,
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

  const setNewQuiz = useCallback((quiz: Quiz) => {
    dispatch({ type: 'SET_NEW_QUIZ', quiz });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo<QuizContextValue>(() => ({
    ...state,
    setNewQuiz,
    submitAnswer,
    reset,
  }), [state, setNewQuiz, submitAnswer, reset]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return ctx;
}
