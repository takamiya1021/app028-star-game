import { render, screen } from '@testing-library/react';
import StarDetail from '@/components/DetailModal/StarDetail';
import type { Star } from '@/types/star';
import type { Constellation } from '@/types/constellation';

const buildStar = (overrides?: Partial<Star>): Star => ({
  id: 12345,
  ra: 83.822,
  dec: -5.391,
  vmag: 0.5,
  bv: 0.3,
  spectralType: 'B8Ia',
  name: 'HR 1713',
  properName: 'リゲル',
  hd: 34085,
  hr: 1713,
  parallax: 3.78,
  pmRA: 0.1,
  pmDE: -0.2,
  ...overrides,
});

const buildConstellation = (): Constellation => ({
  id: 'Ori',
  name: 'Orion',
  nameJa: 'オリオン座',
  mythology: '狩人の物語。',
  season: '冬',
  hemisphere: 'north',
  mainStars: [12345],
  difficulty: 'easy',
});

describe('StarDetail', () => {
  it('renders star properties including distance', () => {
    const star = buildStar();
    render(<StarDetail star={star} constellation={buildConstellation()} />);

    expect(screen.getByRole('heading', { name: /リゲル/ })).toBeInTheDocument();
    expect(screen.getByText(/B8Ia/)).toBeInTheDocument();
    expect(screen.getByText(/等級: 0.5/)).toBeInTheDocument();
    expect(screen.getByText(/距離: 約/)).toHaveTextContent(/距離: 約 86\d 光年/);
    expect(screen.getByText(/所属: オリオン座/)).toBeInTheDocument();
  });

  it('falls back to catalog name and handles missing distance', () => {
    const star = buildStar({
      properName: undefined,
      parallax: null,
      spectralType: null,
      vmag: null,
    });
    render(<StarDetail star={star} />);

    expect(screen.getByRole('heading', { name: /HR 1713/ })).toBeInTheDocument();
    expect(screen.getByText(/スペクトル情報は未登録/)).toBeInTheDocument();
    expect(screen.getByText(/等級情報は未登録/)).toBeInTheDocument();
    expect(screen.getByText(/距離情報は未登録/)).toBeInTheDocument();
  });

  it('shows catalog identifiers when available', () => {
    const star = buildStar();
    render(<StarDetail star={star} />);

    expect(screen.getByText(/HD 34085/)).toBeInTheDocument();
    expect(screen.getByText(/HR 1713/)).toBeInTheDocument();
    expect(screen.getByText(/HIP 12345/)).toBeInTheDocument();
  });
});
