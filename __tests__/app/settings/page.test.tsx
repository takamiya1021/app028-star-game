import { render, screen } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';
import Providers from '@/app/providers';

describe('Settings page', () => {
  const renderPage = () =>
    render(
      <Providers>
        <SettingsPage />
      </Providers>
    );

  it('renders settings heading and description', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: /設定/ })).toBeInTheDocument();
    expect(screen.getByText(/観測体験を好みに合わせて調整/i)).toBeInTheDocument();
  });

  it('includes the SettingsPanel component', () => {
    renderPage();

    expect(screen.getByLabelText('観測エリア')).toBeInTheDocument();
    expect(screen.getByLabelText('難易度')).toBeInTheDocument();
  });
});
