import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/FhssStarterApp/);

  await expect(page.getByText('The home page is working!')).toBeDefined();
});
