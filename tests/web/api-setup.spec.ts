import { test, expect } from '@playwright/test';
import { loadApiUser } from '../../src/api/testUser';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { BankApi } from '../../src/api/client';

const region = loadRegion();

test('overview shows an account and a transfer created through the API', async ({ page, request }) => {
  test.setTimeout(90_000);

  // UI: register a fresh user (this also logs them in).
  const user = await registerUser(page, region);

  // API: use the new user's credentials to create a savings account and move $25 into it.
  const api = new BankApi(request, region);
  const customer = await api.login(user.username, user.password);
  const [checking] = await api.getAccounts(customer.id);
  const savings = await api.createSavingsAccount(customer.id, checking.id);
  await api.transfer(checking.id, savings.id, 25);

  // UI: the overview must show what the API did (checking 515.50 - 100 - 25, savings 100 + 25).
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  const table = page.locator('#accountTable');
  await expect(table).toContainText(String(savings.id));
  await expect(table).toContainText('$390.50');
  await expect(table).toContainText('$125.00');
});