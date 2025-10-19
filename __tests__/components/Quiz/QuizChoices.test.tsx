import { render, screen, fireEvent } from '@testing-library/react';
import QuizChoices from '@/components/Quiz/QuizChoices';

describe('QuizChoices', () => {
  const choices = ['A', 'B', 'C'];

  it('renders all choices', () => {
    const onSelect = jest.fn();
    render(<QuizChoices choices={choices} onSelect={onSelect} />);
    choices.forEach((choice) => {
      expect(screen.getByText(choice)).toBeInTheDocument();
    });
  });

  it('calls onSelect when a choice is clicked', () => {
    const onSelect = jest.fn();
    render(<QuizChoices choices={choices} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('B'));
    expect(onSelect).toHaveBeenCalledWith('B');
  });

  it('disables buttons when disabled prop is true', () => {
    const onSelect = jest.fn();
    render(<QuizChoices choices={choices} onSelect={onSelect} disabled />);
    const button = screen.getByText('A');
    expect(button).toBeDisabled();
  });

  it('highlights the selected choice', () => {
    const onSelect = jest.fn();
    render(<QuizChoices choices={choices} onSelect={onSelect} selected="C" />);
    const selectedButton = screen.getByText('C');
    expect(selectedButton).toHaveClass('bg-blue-500/20');
    const otherButton = screen.getByText('A');
    expect(otherButton).not.toHaveClass('bg-blue-500/20');
  });
});
