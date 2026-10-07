import { test as setup } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { API_USER_FILE } from '../../src/api/testUser';

const region = loadRegion();

// Runs once before the API tests: registers a brand-new user in the browser
// and stores the credentials, so API tests never touch shared demo data.
setup('register a fresh user for the API tests', async ({ page }) => {
  setup.setTimeout(90_000);
  const user = await registerUser(page, region);
  fs.mkdirSync(path.dirname(API_USER_FILE), { recursive: true });
  fs.writeFileSync(API_USER_FILE, JSON.stringify({ username: user.username, password: user.password }));
});