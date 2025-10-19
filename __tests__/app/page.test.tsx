import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import Providers from '@/app/providers';
import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

jest.mock('@/lib/data/starsLoader', () => ({
  loadStars: jest.fn(),
}));

jest.mock('@/lib/data/quizGenerator', () => ({
  generateQuiz: jest.fn(),
}));

describe('Home page', () => {
  const mockStars: Star[] = [
    {
      id: 1,
      ra: 0,
      dec: 0,
      vmag: 1.0,
      bv: 0.2,
      spectralType: 'A',
      name: 'Alpha',
      properName: 'アルファ',
      hd: null,
      hr: null,
      parallax: null,
      pmRA: null,
      pmDE: null,
    },
    {
      id: 2,
      ra: 10,
      dec: -5,
      vmag: 8.5,
      bv: 0.4,
      spectralType: 'G',
      name: 'Beta',
      properName: 'ベータ',
      hd: null,
      hr: null,
      parallax: null,
      pmRA: null,
      pmDE: null,
    },
  ];

  const mockQuiz: Quiz = {
    id: 'quiz-1',
    type: 'constellation',
    questionType: 'description',
    question: '「オリオン座」の英語名を選んでください。',
    correctAnswer: 'Orion',
    choices: ['Orion', 'Lyra', 'Cygnus', 'Cassiopeia'],
    constellationId: 'Ori',
    difficulty: 'easy',
  };

  const loadStars = jest.mocked(require('@/lib/data/starsLoader').loadStars);
  const generateQuiz = jest.mocked(require('@/lib/data/quizGenerator').generateQuiz);

  beforeEach(() => {
    jest.useFakeTimers();
    loadStars.mockResolvedValue(mockStars);
    generateQuiz.mockResolvedValue(mockQuiz);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderHome = () =>
    render(
      <Providers>
        <Home />
      </Providers>
    );

  it('renders the starfield and header text', async () => {
    renderHome();

    expect(await screen.findByRole('heading', { name: /Stellarium Quiz/i })).toBeInTheDocument();
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('toggles projection mode button text', async () => {
    renderHome();

    const button = await screen.findByRole('button', { name: /投影モードを切り替える/ });
    expect(button).toHaveTextContent('宇宙ビュー');

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('プラネタリウム');
    });
  });

  it('toggles observation mode description', async () => {
    renderHome();

    const button = await screen.findByRole('button', { name: /観測モードを切り替える/ });
    expect(button).toHaveTextContent('肉眼観測');

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('高感度望遠鏡');
    });
  });

  it('integrates quiz container', async () => {
    renderHome();

    expect(await screen.findByText(/星空クイズ/)).toBeInTheDocument();
  });
});
