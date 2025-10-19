import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import Home from '@/app/page';
import Providers from '@/app/providers';
import { loadStars } from '@/lib/data/starsLoader';

jest.mock('@/lib/data/starsLoader');
const starFieldMock = jest.fn();
jest.mock('@/components/StarField/StarField', () => ({
  __esModule: true,
  default: (props: unknown) => starFieldMock(props),
}));
jest.mock('@/components/Quiz/QuizContainer', () => () => <div data-testid="mock-quiz" />);
jest.mock('@/components/Score/ScoreDisplay', () => () => <div data-testid="mock-score" />);

const mockedLoadStars = loadStars as jest.MockedFunction<typeof loadStars>;

describe('Home page star data loading', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedLoadStars.mockReset();
    starFieldMock.mockReset();
    starFieldMock.mockImplementation(({ stars }: { stars?: unknown[] }) => (
      <div data-testid="mock-starfield" data-count={stars?.length ?? 0} />
    ));
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
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

  it('shows a guidance message when Canvas is not supported', async () => {
    mockedLoadStars.mockResolvedValue([]);
    starFieldMock.mockImplementation(({ onCanvasSupportChange }: { onCanvasSupportChange?: (supported: boolean) => void }) => {
      useEffect(() => {
        onCanvasSupportChange?.(false);
      }, [onCanvasSupportChange]);
      return <div data-testid="mock-starfield" />;
    });

    render(
      <Providers>
        <Home />
      </Providers>
    );

    expect(await screen.findByText('お使いのブラウザではCanvasがサポートされていません。')).toBeInTheDocument();
    expect(screen.getByText('最新のブラウザに更新するか、別のデバイスで再度お試しください。')).toBeInTheDocument();
  });
});
