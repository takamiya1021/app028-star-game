import { render, screen } from '@testing-library/react';
import ScoreDisplay from '@/components/Score/ScoreDisplay';
import type { Score } from '@/types/quiz';

const renderComponent = (
  score: Score,
  options: { streak?: number; label?: string; className?: string } = {}
) =>
  render(
    <ScoreDisplay
      score={score}
      streak={options.streak}
      label={options.label}
      className={options.className}
    />
  );

describe('ScoreDisplay', () => {
  it('shows correct and total counts', () => {
    const score: Score = { correct: 7, total: 10, percentage: 70 };
    renderComponent(score);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
  });

  it('renders percentage with percent symbol', () => {
    const score: Score = { correct: 3, total: 5, percentage: 60 };
    renderComponent(score);

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows streak information when provided', () => {
    const score: Score = { correct: 3, total: 5, percentage: 60 };
    renderComponent(score, { streak: 4 });

    expect(screen.getByText('連続正解: 4')).toBeInTheDocument();
  });

  it('clamps percentage when total is zero', () => {
    const score: Score = { correct: 0, total: 0, percentage: 0 };
    renderComponent(score);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('allows overriding label and className', () => {
    const score: Score = { correct: 1, total: 2, percentage: 50 };
    renderComponent(score, { label: 'Session Score', className: 'custom-score' });

    const container = screen.getByTestId('score-display');
    expect(container).toHaveClass('custom-score');
    expect(screen.getByText('Session Score')).toBeInTheDocument();
  });
});
