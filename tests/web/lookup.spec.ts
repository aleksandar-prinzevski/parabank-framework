import { test } from '@playwright/test';

test('open lookup page', async ({ page }) => {
  await page.goto('lookup.htm');
});