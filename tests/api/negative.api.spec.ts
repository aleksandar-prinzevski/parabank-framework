import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';

const region = loadRegion();
const user = region.existingUser;
const json = { accept: 'application/json' };

// Negative scenarios: requests that are invalid and should be rejected.
// Each test sends one bad request and checks how the API answers.

test('unknown account returns 400', async ({ request }) => {
  const res = await request.get(`login/${user.username}/wrong-password`, { headers: json });
  expect(res.status()).toBe(400);
  expect(await res.text()).toContain('Invalid username and/or password');
});

// Behavior not known yet: we print the response first, then add assertions.
test('login with a wrong password', async ({ request }) => {
  const res = await request.get(`login/${user.username}/wrong-password`, { headers: json });
  console.log(res.status(), await res.text());
});