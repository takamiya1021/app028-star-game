import { render, screen } from '@testing-library/react';
import ConstellationDetail from '@/components/DetailModal/ConstellationDetail';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';

const buildConstellation = (overrides?: Partial<Constellation>): Constellation => ({
  id: 'Ori',
  name: 'Orion',
  nameJa: 'オリオン座',
  mythology: 'ギリシャ神話の狩人。',
  season: '冬',
  hemisphere: 'north',
  mainStars: [1, 2],
  illustrationPath: '/images/orion.png',
  difficulty: 'easy',
  ...overrides,
});

const buildStars = (): Star[] => [
  {
    id: 1,
    ra: 0,
    dec: 0,
    vmag: 1.9,
    bv: null,
    spectralType: 'B',
    name: 'Betelgeuse',
    properName: 'ベテルギウス',
    hd: null,
    hr: null,
    parallax: null,
    pmRA: null,
    pmDE: null,
  },
  {
    id: 2,
    ra: 0,
    dec: 0,
    vmag: 0.5,
    bv: null,
    spectralType: 'B',
    name: 'Rigel',
    properName: 'リゲル',
    hd: null,
    hr: null,
    parallax: null,
    pmRA: null,
    pmDE: null,
  },
];

describe('ConstellationDetail', () => {
  it('renders basic constellation information', () => {
    const constellation = buildConstellation();
    render(<ConstellationDetail constellation={constellation} stars={buildStars()} />);

    expect(screen.getByRole('heading', { name: /オリオン座/i })).toBeInTheDocument();
    expect(screen.getByText(/Orion/)).toBeInTheDocument();
    expect(screen.getByText(/難易度/)).toBeInTheDocument();
    expect(screen.getByText(/北天/)).toBeInTheDocument();
  });

  it('lists main stars with friendly names', () => {
    const constellation = buildConstellation();
    render(<ConstellationDetail constellation={constellation} stars={buildStars()} />);

    expect(screen.getByText('ベテルギウス')).toBeInTheDocument();
    expect(screen.getByText('リゲル')).toBeInTheDocument();
  });

  it('shows mythology and seasonal description when available', () => {
    const constellation = buildConstellation();
    render(<ConstellationDetail constellation={constellation} />);

    expect(screen.getByText(/ギリシャ神話の狩人/)).toBeInTheDocument();
    expect(screen.getByText(/冬に見頃/)).toBeInTheDocument();
  });

  it('falls back gracefully when optional data is missing', () => {
    const constellation = buildConstellation({
      mythology: undefined,
      season: undefined,
      mainStars: [],
    });
    render(<ConstellationDetail constellation={constellation} />);

    expect(screen.getByText(/神話情報は登録されていません/)).toBeInTheDocument();
    expect(screen.getByText(/代表的な恒星情報はありません/)).toBeInTheDocument();
  });
});
