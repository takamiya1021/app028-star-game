import { test, expect } from '@playwright/test';

const forcedQuizzes = [
  {
    id: 'quiz-e2e-1',
    type: 'constellation',
    questionType: 'description',
    question: '「オリオン座」の英語名を選んでください。',
    correctAnswer: 'Orion',
    choices: ['Orion', 'Lyra', 'Cygnus', 'Cassiopeia'],
    constellationId: 'Ori',
    difficulty: 'easy',
  },
  {
    id: 'quiz-e2e-2',
    type: 'constellation',
    questionType: 'description',
    question: '「はくちょう座」の英語名を選んでください。',
    correctAnswer: 'Cygnus',
    choices: ['Cygnus', 'Lyra', 'Orion', 'Cassiopeia'],
    constellationId: 'Cyg',
    difficulty: 'easy',
  },
] as const;

test.describe('Quiz flow', () => {
  test('increments score after answering correctly', async ({ page }) => {
    await page.addInitScript((quizzes) => {
      (window as typeof window & { __E2E_QUIZ__?: typeof quizzes[number]; __E2E_QUIZ_QUEUE__?: typeof quizzes }).__E2E_QUIZ__ = quizzes[0];
      (window as typeof window & { __E2E_QUIZ__?: typeof quizzes[number]; __E2E_QUIZ_QUEUE__?: typeof quizzes }).__E2E_QUIZ_QUEUE__ = quizzes.slice(1);
    }, forcedQuizzes);

    await page.goto('/');

    await page.getByTestId('quiz-container').waitFor({ state: 'visible' });

    await page.getByTestId('choice-Orion').click();
    await page.waitForTimeout(200);
    await expect(page.getByText(/正解！|残念、不正解。/)).toBeVisible();
    await expect(page.getByText(/スコア: \d+\/\d+/)).toBeVisible();

    await page.getByTestId('next-quiz-button').click();
    await page.waitForTimeout(200);
    await expect(page.getByTestId('quiz-container')).toBeVisible();
  });
});
