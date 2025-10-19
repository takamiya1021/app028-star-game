import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import AppErrorBoundary from '@/components/ErrorBoundary/AppErrorBoundary';

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <div>scene restored</div>;
}

describe('AppErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error happens', () => {
    render(
      <AppErrorBoundary>
        <div>normal render</div>
      </AppErrorBoundary>
    );

    expect(screen.getByText('normal render')).toBeInTheDocument();
  });

  it('shows fallback and recovers after retry', async () => {
    function Harness() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <AppErrorBoundary onReset={() => setShouldThrow(false)}>
          <Thrower shouldThrow={shouldThrow} />
        </AppErrorBoundary>
      );
    }

    render(<Harness />);

    expect(
      screen.getByText('予期せぬエラーが発生しました')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(await screen.findByText('scene restored')).toBeInTheDocument();
  });
});
