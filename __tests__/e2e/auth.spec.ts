import { expect, test } from '@playwright/test';

import { auth, generateUniqueId } from '../auth';

test('Profile shows username', async ({ context, page }) => {
  const ctx = await auth.$context;
  const testUtils = ctx.test;

  const uniqueId = generateUniqueId();

  const user = testUtils.createUser({
    name: 'E2E User',
    username: `e2e_${uniqueId}`,
    email: `e2e_${uniqueId}@example.com`,
  });
  await testUtils.saveUser(user);

  const cookies = await testUtils.getCookies({
    userId: user.id,
    domain: 'localhost',
  });
  await context.addCookies(cookies);

  await page.goto('/profile');

  await expect(page.getByText('E2E User', { exact: true })).toBeVisible();

  await testUtils.deleteUser(user.id);
});
