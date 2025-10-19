import { drawStars, clearStarRendererCaches } from '@/lib/canvas/starRenderer';
import { setDrawStarsObserver } from '@/performance/drawStarsObserver';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Providers from '@/app/providers';
import QuizContainer from '@/components/Quiz/QuizContainer';

jest.mock('@/lib/data/quizGenerator', () => ({
  generateQuiz: jest.fn(),
}));

const mockGenerateQuiz = jest.mocked(require('@/lib/data/quizGenerator').generateQuiz);

function createStubContext(): CanvasRenderingContext2D {
  const noop = () => {};
  const gradient = { addColorStop: noop };

  return {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    beginPath: noop,
    arc: noop,
    fill: noop,
    fillRect: noop,
    fillText: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    createRadialGradient: () => gradient as unknown as CanvasGradient,
    save: noop,
    restore: noop,
    clearRect: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    setTransform: noop,
    measureText: () => ({ width: 0 }) as TextMetrics,
    clip: noop,
    closePath: noop,
    drawImage: noop,
  } as unknown as CanvasRenderingContext2D;
}

const createStar = (id: number) => ({
  id,
  ra: Math.random() * 360,
  dec: Math.random() * 180 - 90,
  vmag: Math.random() * 6,
  bv: 0,
  spectralType: null,
  name: `Star ${id}`,
  properName: `スター${id}`,
  hd: null,
  hr: null,
  parallax: null,
  pmRA: null,
  pmDE: null,
});

describe('performance: drawStars', () => {
  afterEach(() => {
    setDrawStarsObserver(null);
    clearStarRendererCaches();
  });

  it('measures drawStars execution time under standard load', () => {
    const stars = Array.from({ length: 3000 }, (_, idx) => createStar(idx + 1));
    const ctx = createStubContext();

    const measurements: number[] = [];
    setDrawStarsObserver((durationMs) => {
      measurements.push(durationMs);
    });

    drawStars(
      ctx,
      stars,
      { ra: 90, dec: 0 },
      2,
      1024,
      1024,
      0,
      'orthographic'
    );

    expect(measurements.length).toBe(1);
    // Red phase: no strict assertion yet, but ensure a finite number was recorded.
    expect(Number.isFinite(measurements[0])).toBe(true);
  });
});

describe('performance: React rendering', () => {
  it('tracks QuizContainer re-render count during rapid updates', async () => {
    let renderCount = 0;
    const quiz = {
      id: 'quiz-1',
      type: 'constellation',
      questionType: 'description',
      question: 'オリオン座はどれ？',
      correctAnswer: 'Orion',
      choices: ['Orion', 'Lyra', 'Cygnus', 'Cassiopeia'],
      constellationId: 'Ori',
      difficulty: 'easy',
    } as const;

    mockGenerateQuiz.mockResolvedValue(quiz);

    function InstrumentedQuizContainer() {
      renderCount += 1;
      return <QuizContainer />;
    }

    render(
      <Providers>
        <InstrumentedQuizContainer />
      </Providers>
    );

    await screen.findByText(quiz.question);

    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(screen.getByTestId('choice-Orion'));
      await waitFor(() => screen.getByText('正解！'));
      fireEvent.click(screen.getByTestId('next-quiz-button'));
      mockGenerateQuiz.mockResolvedValueOnce(quiz);
      await waitFor(() => screen.getByText(quiz.question));
    }

    expect(renderCount).toBeLessThanOrEqual(20);
  });
});
