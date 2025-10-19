import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizContainer from '@/components/Quiz/QuizContainer';
import { QuizProvider } from '@/context/QuizContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { generateQuiz } from '@/lib/data/quizGenerator';
import type { Quiz } from '@/types/quiz';

jest.mock('@/lib/data/quizGenerator', () => ({
  generateQuiz: jest.fn(),
}));

const mockGenerateQuiz = jest.mocked(generateQuiz);

const renderWithProviders = () =>
  render(
    <SettingsProvider>
      <QuizProvider>
        <QuizContainer />
      </QuizProvider>
    </SettingsProvider>
  );

const buildQuiz = (overrides?: Partial<Quiz>): Quiz => ({
  id: 'quiz-1',
  type: 'constellation',
  questionType: 'description',
  question: '「オリオン座」の英語名を選んでください。',
  correctAnswer: 'Orion',
  choices: ['Orion', 'Lyra', 'Cygnus', 'Cassiopeia'],
  constellationId: 'Ori',
  difficulty: 'easy',
  ...overrides,
});

describe('QuizContainer', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    mockGenerateQuiz.mockReset();
  });

  it('loads a quiz and renders question with choices', async () => {
    mockGenerateQuiz.mockResolvedValueOnce(buildQuiz());

    renderWithProviders();

    expect(await screen.findByText('星空クイズ')).toBeInTheDocument();
    expect(await screen.findByText('「オリオン座」の英語名を選んでください。')).toBeInTheDocument();
    expect(await screen.findByText('スコア: 0/1')).toBeInTheDocument();
    expect(screen.getByText('Orion')).toBeInTheDocument();
  });

  it('submits an answer and shows the result', async () => {
    mockGenerateQuiz.mockResolvedValueOnce(buildQuiz());

    renderWithProviders();

    await screen.findByText('「オリオン座」の英語名を選んでください。');

    fireEvent.click(screen.getByText('Orion'));

    expect(await screen.findByText('正解！')).toBeInTheDocument();
    expect(await screen.findByText('スコア: 1/1')).toBeInTheDocument();
    expect(screen.queryByTestId('choice-Orion')).not.toBeInTheDocument();
  });

  it('loads a new quiz when next button is clicked', async () => {
    mockGenerateQuiz.mockResolvedValueOnce(buildQuiz());
    mockGenerateQuiz.mockResolvedValueOnce(
      buildQuiz({
        id: 'quiz-2',
        question: '「はくちょう座」の英語名を選んでください。',
        correctAnswer: 'Cygnus',
        choices: ['Cygnus', 'Lyra', 'Orion', 'Cassiopeia'],
        constellationId: 'Cyg',
      })
    );

    renderWithProviders();

    await screen.findByText('「オリオン座」の英語名を選んでください。');
    fireEvent.click(screen.getByText('Orion'));
    await screen.findByText('正解！');

    fireEvent.click(screen.getByTestId('next-quiz-button'));

    await waitFor(() => {
      expect(mockGenerateQuiz).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('「はくちょう座」の英語名を選んでください。')).toBeInTheDocument();
    expect(await screen.findByText('スコア: 1/2')).toBeInTheDocument();
  });

  it('ignores extra next clicks while loading a new quiz', async () => {
    mockGenerateQuiz.mockResolvedValueOnce(buildQuiz());

    let resolveNextQuiz: (() => void) | undefined;
    const pendingQuiz = new Promise<Quiz>((resolve) => {
      resolveNextQuiz = () =>
        resolve(
          buildQuiz({
            id: 'quiz-3',
            question: '「こと座」の英語名を選んでください。',
            correctAnswer: 'Lyra',
            choices: ['Lyra', 'Cygnus', 'Orion', 'Cassiopeia'],
            constellationId: 'Lyr',
          })
        );
    });

    mockGenerateQuiz.mockReturnValueOnce(pendingQuiz);

    renderWithProviders();

    await screen.findByText('「オリオン座」の英語名を選んでください。');
    fireEvent.click(screen.getByText('Orion'));
    await screen.findByText('正解！');

    const nextButton = screen.getByTestId('next-quiz-button');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(mockGenerateQuiz).toHaveBeenCalledTimes(2);

    resolveNextQuiz?.();
    await screen.findByText('「こと座」の英語名を選んでください。');
  });

  it('shows error message when quiz loading fails', async () => {
    mockGenerateQuiz.mockRejectedValueOnce(new Error('network error'));

    renderWithProviders();

    expect(await screen.findByText('クイズの取得に失敗しました')).toBeInTheDocument();
    expect(screen.getByText('スコア: 0/0')).toBeInTheDocument();
  });
});
