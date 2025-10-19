import { render, screen } from '@testing-library/react';
import { StaggerContainer } from '@/components/Animate/StaggerContainer';
import { motion } from 'framer-motion';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
}));

describe('StaggerContainer', () => {
  it('renders children with motion attributes', () => {
    render(
      <StaggerContainer data-testid="stagger">
        <span>child</span>
      </StaggerContainer>
    );

    const container = screen.getByTestId('stagger');
    expect(container).toHaveAttribute('data-motion', 'stagger');
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
