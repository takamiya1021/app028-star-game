import { test, expect } from '@playwright/test';

test.describe('Home page smoke', () => {
  test('renders quiz header and controls', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '✨ Stellarium Quiz ✨' })).toBeVisible();
    await expect(page.getByRole('button', { name: '投影モードを切り替える' })).toBeVisible();
    await expect(page.getByRole('button', { name: /観測モードを切り替える/ })).toBeVisible();
  });

  test('opens mobile quiz panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const openButton = page.getByRole('button', { name: 'クイズを開く' });
    await openButton.click();
    await expect(page.getByRole('dialog', { name: 'クイズパネル' })).toBeVisible();
  });
});
