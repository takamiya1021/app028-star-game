import { render, screen } from '@testing-library/react';
import { FadeIn } from '@/components/Animate/FadeIn';

describe('FadeIn', () => {
  it('applies motion attributes and renders children', () => {
    render(
      <FadeIn data-testid="fade" delay={0.2}>
        <span>animated</span>
      </FadeIn>
    );

    const wrapper = screen.getByTestId('fade');
    expect(wrapper).toHaveAttribute('data-motion', 'fade-in');
    expect(screen.getByText('animated')).toBeInTheDocument();
  });

  it('supports alternate HTML elements', () => {
    render(
      <FadeIn as="section" data-testid="fade-section">
        <span>section</span>
      </FadeIn>
    );

    const wrapper = screen.getByTestId('fade-section');
    expect(wrapper.tagName.toLowerCase()).toBe('section');
  });
});
