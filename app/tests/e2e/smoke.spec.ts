import { test, expect } from '@playwright/test';

test('app root loads with a non-empty page title', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
