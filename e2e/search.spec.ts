import { test, expect } from '@playwright/test';

test.describe('Search to Result Flow', () => {
  test('should search for a product and display results', async ({ page }) => {
    await page.goto('/');

    // Verify the landing page
    await expect(page.getByText('Compare Prices Across Retailers')).toBeVisible();

    // Fill in the search form
    await page.getByPlaceholder('What are you looking for?').fill('cordless drill');
    await page.getByPlaceholder('Zip Code').fill('55401');

    // Submit search
    await page.getByRole('button', { name: /search inventory/i }).click();

    // Wait for results or status indicators
    await expect(
      page.getByText(/Amazon|Target|Menards/i).first()
    ).toBeVisible({ timeout: 30000 });

    // Verify result count is shown
    await expect(page.getByText(/result/i)).toBeVisible({ timeout: 30000 });
  });

  test('should persist zip code across page reloads', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Zip Code').fill('90210');
    await page.getByPlaceholder('What are you looking for?').fill('hammer');
    await page.getByRole('button', { name: /search inventory/i }).click();

    // Reload the page
    await page.reload();

    // Zip code should be persisted
    const zipInput = page.getByPlaceholder('Zip Code');
    await expect(zipInput).toHaveValue('90210');
  });

  test('should show skeleton loaders while fetching', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('What are you looking for?').fill('wrench');
    await page.getByPlaceholder('Zip Code').fill('60601');
    await page.getByRole('button', { name: /search inventory/i }).click();

    // Button should show loading state
    await expect(
      page.getByRole('button', { name: /searching/i })
    ).toBeVisible();
  });
});
