import { test, expect } from '@playwright/test';
import { loadApiUser } from '../../src/api/testUser';

const json = { accept: 'application/json' };
// Negative scenarios: requests that are invalid and should be rejected.
// Each test sends one bad request and checks how the API answers.

test('unknown account returns 400', async ({ request }) => {
  const res = await request.get('accounts/99999999', { headers: json });
  expect(res.status()).toBe(400);
});

// Wrong password: the API must refuse the login with a clear message.
test('login with a wrong password', async ({ request }) => {
  const user = loadApiUser(); // read inside the test: the setup project has already created the file
  const res = await request.get(`login/${user.username}/wrong-password`, { headers: json });
  expect(res.status()).toBe(400);
  expect(await res.text()).toContain('Invalid username and/or password');
});