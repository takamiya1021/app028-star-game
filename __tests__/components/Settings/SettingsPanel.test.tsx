import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '@/components/Settings/SettingsPanel';
import { SettingsProvider } from '@/context/SettingsContext';

const renderComponent = () =>
  render(
    <SettingsProvider>
      <SettingsPanel />
    </SettingsProvider>
  );

describe('SettingsPanel', () => {
  it('allows selecting a category', () => {
    renderComponent();

    const select = screen.getByLabelText('観測エリア');
    fireEvent.change(select, { target: { value: 'south' } });

    expect(select).toHaveValue('south');
  });

  it('allows selecting difficulty', () => {
    renderComponent();

    const select = screen.getByLabelText('難易度');
    fireEvent.change(select, { target: { value: 'hard' } });

    expect(select).toHaveValue('hard');
  });

  it('allows selecting question count', () => {
    renderComponent();

    const select = screen.getByLabelText('出題数');
    fireEvent.change(select, { target: { value: '20' } });

    expect(select).toHaveValue('20');
  });

  it('toggles sound setting', () => {
    renderComponent();

    const toggle = screen.getByLabelText('効果音を有効にする');
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('toggles proper name visibility', () => {
    renderComponent();

    const toggle = screen.getByLabelText('固有名を表示する');
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('toggles bayer designation visibility', () => {
    renderComponent();

    const toggle = screen.getByLabelText('バイエル記号を表示する');
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
  });
});
