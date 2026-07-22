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

  const baseURL = test.info().project.use.baseURL || 'http://localhost:3000';
  const cookies = await testUtils.getCookies({
    userId: user.id,
  });

  await context.addCookies(
    cookies.map((cookie) => ({
      ...cookie,
      url: baseURL,
    }))
  );

  await page.goto('/profile');

  await expect(page.getByText('E2E User', { exact: true })).toBeVisible();

  await testUtils.deleteUser(user.id);
});
