import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import Providers from '@/app/providers';
import { loadStars } from '@/lib/data/starsLoader';

jest.mock('@/lib/data/starsLoader');
jest.mock('@/components/StarField/StarField', () => ({ stars }: { stars: unknown[] }) => (
  <div data-testid="mock-starfield" data-count={stars.length} />
));
jest.mock('@/components/Quiz/QuizContainer', () => () => <div data-testid="mock-quiz" />);
jest.mock('@/components/Score/ScoreDisplay', () => () => <div data-testid="mock-score" />);

const mockedLoadStars = loadStars as jest.MockedFunction<typeof loadStars>;

describe('Home page star data loading', () => {
  beforeEach(() => {
    mockedLoadStars.mockReset();
  });

  it('displays an error message and allows retry when loading fails', async () => {
    mockedLoadStars.mockRejectedValueOnce(new Error('network'));
    mockedLoadStars.mockResolvedValueOnce([]);

    render(
      <Providers>
        <Home />
      </Providers>
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('星データの読み込みに失敗しました');

    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    await waitFor(() => expect(mockedLoadStars).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('loads stars without showing an error when request succeeds', async () => {
    mockedLoadStars.mockResolvedValue([]);

    render(
      <Providers>
        <Home />
      </Providers>
    );

    await waitFor(() => expect(mockedLoadStars).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
