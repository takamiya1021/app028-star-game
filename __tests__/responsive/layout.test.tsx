import { render, screen, fireEvent, within } from '@testing-library/react';
import Home from '@/app/page';
import SettingsPage from '@/app/settings/page';
import EncyclopediaPage from '@/app/encyclopedia/page';
import Providers from '@/app/providers';
import type { Star } from '@/types/star';
import type { Constellation } from '@/types/constellation';

jest.mock('@/lib/data/starsLoader', () => ({
  loadStars: jest.fn(),
}));

jest.mock('@/lib/data/constellationsLoader', () => ({
  loadConstellations: jest.fn(),
}));

const loadStars = jest.mocked(require('@/lib/data/starsLoader').loadStars);
const loadConstellations = jest.mocked(require('@/lib/data/constellationsLoader').loadConstellations);

const sampleStars: Star[] = [
  {
    id: 1,
    ra: 0,
    dec: 0,
    vmag: 1.0,
    bv: 0.3,
    spectralType: 'A0',
    name: 'Alpha',
    properName: 'アルファ',
    hd: null,
    hr: null,
    parallax: null,
    pmRA: null,
    pmDE: null,
  },
];

const sampleConstellations: Constellation[] = [
  {
    id: 'Ori',
    name: 'Orion',
    nameJa: 'オリオン座',
    mythology: 'ギリシャ神話の狩人オリオン。',
    season: '冬',
    hemisphere: 'north',
    mainStars: [1],
    difficulty: 'easy',
  },
];

describe('Responsive layout classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadStars.mockResolvedValue(sampleStars);
    loadConstellations.mockResolvedValue(sampleConstellations);
  });

  it('Home page retains responsive control classes', async () => {
    const { container } = render(
      <Providers>
        <Home />
      </Providers>
    );

    await screen.findByRole('heading', { name: /Stellarium Quiz/i });

    const sidePanel = container.querySelector('aside');
    expect(sidePanel?.className).toContain('hidden');
    expect(sidePanel?.className).toContain('xl:flex');

    const projectionButton = screen.getByRole('button', { name: /投影モードを切り替える/ });
    expect(projectionButton.className).toContain('sm:max-w-xs');

    const quizToggleButton = screen.getByRole('button', { name: /クイズを開く/ });
    expect(quizToggleButton.className).toContain('sm:hidden');
  });

  it('Settings page header keeps responsive typography', () => {
    render(
      <Providers>
        <SettingsPage />
      </Providers>
    );

    const heading = screen.getByRole('heading', { level: 1, name: '設定' });
    expect(heading.className).toContain('sm:text-4xl');
  });

  it('Encyclopedia grid and modal expose responsive classes', async () => {
    const { container } = render(
      <Providers>
        <EncyclopediaPage />
      </Providers>
    );

    const grid = await screen.findByRole('list');
    expect(grid.className).toContain('sm:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-3');

    const detailButton = screen.getByRole('button', { name: 'オリオン座の詳細を開く' });
    fireEvent.click(detailButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toContain('fixed');
    expect(dialog.className).toContain('px-4');

    const starButton = within(dialog).getByRole('button', { name: 'アルファの詳細を見る' });
    expect(starButton.className).toContain('hover:border-blue-400/70');
  });
});
