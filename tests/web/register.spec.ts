import { test } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('register a new user', async ({ page }) => {
  const user = await registerUser(page, region);
  console.log('Registered user:', user.username);
});