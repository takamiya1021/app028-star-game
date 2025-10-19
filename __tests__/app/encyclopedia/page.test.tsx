import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import EncyclopediaPage from '@/app/encyclopedia/page';
import Providers from '@/app/providers';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';

jest.mock('@/lib/data/constellationsLoader', () => ({
  loadConstellations: jest.fn(),
}));

jest.mock('@/lib/data/starsLoader', () => ({
  loadStars: jest.fn(),
}));

describe('Encyclopedia page', () => {
  const constellations: Constellation[] = [
    {
      id: 'Ori',
      name: 'Orion',
      nameJa: 'オリオン座',
      mythology: 'ギリシャ神話の狩人オリオン。七つの星が腰の帯を形作る。',
      season: '冬',
      hemisphere: 'north',
      mainStars: [1, 2],
      difficulty: 'easy',
    },
  ];

  const stars: Star[] = [
    {
      id: 1,
      ra: 83.822,
      dec: -5.391,
      vmag: 0.5,
      bv: 0.2,
      spectralType: 'B8Ia',
      name: 'Betelgeuse',
      properName: 'ベテルギウス',
      hd: 39801,
      hr: 2061,
      parallax: 3.78,
      pmRA: 27,
      pmDE: 11,
    },
    {
      id: 2,
      ra: 78.634,
      dec: -8.202,
      vmag: 0.1,
      bv: -0.03,
      spectralType: 'B0Ib',
      name: 'Rigel',
      properName: 'リゲル',
      hd: 34085,
      hr: 1713,
      parallax: 3.78,
      pmRA: 1,
      pmDE: -0.5,
    },
  ];

  const loadConstellations = jest.mocked(require('@/lib/data/constellationsLoader').loadConstellations);
  const loadStars = jest.mocked(require('@/lib/data/starsLoader').loadStars);

  beforeEach(() => {
    jest.useFakeTimers();
    loadConstellations.mockResolvedValue(constellations);
    loadStars.mockResolvedValue(stars);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <Providers>
        <EncyclopediaPage />
      </Providers>
    );

  it('renders constellation cards after loading', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /星空図鑑/ })).toBeInTheDocument();
    expect(await screen.findByText('オリオン座')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'オリオン座の詳細を開く' })).toBeInTheDocument();
  });

  it('opens constellation modal and shows star detail', async () => {
    renderPage();

    const openButton = await screen.findByRole('button', { name: 'オリオン座の詳細を開く' });
    fireEvent.click(openButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { level: 2, name: 'オリオン座' })).toBeInTheDocument();

    const starButton = screen.getByRole('button', { name: 'ベテルギウスの詳細を見る' });
    fireEvent.click(starButton);

    await waitFor(() => {
      expect(screen.getByText(/スペクトル型: B8Ia/)).toBeInTheDocument();
    });
  });
});
