import type { TestHelpers } from 'better-auth/plugins';
import type { User } from 'better-auth/types';

import { auth } from './auth.test';

export async function getTestHelpers() {
  const ctx = await auth.$context;
  const testUtils = ctx.test;

  return testUtils;
}

function generateUniqueId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}

/**
 * Narrow `saveUser` result for stable field access (username plugin fields are not inferred on `TestHelpers` yet).
 * Revisit after a Better Auth release improves `ctx.test` typing.
 */
interface TestSavedUserShape extends User {
  username: string;
}

export async function createTestUser(test: TestHelpers) {
  const uniqueId = generateUniqueId();

  const draft = test.createUser({
    name: 'Test User',
    username: `test_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
  });

  const user = (await test.saveUser(draft)) as unknown as TestSavedUserShape;

  return user;
}
