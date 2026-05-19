import { afterAll, beforeAll } from 'bun:test';
import type { TestHelpers } from 'better-auth/plugins';
import type { User } from 'better-auth/types';

import { auth } from './auth.test';

function generateUniqueId() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}

/**
 * Narrow `saveUser` result for stable field access (username plugin fields are not inferred on `TestHelpers` yet).
 * Revisit after a Better Auth release improves `ctx.test` typing.
 */
interface TestUser extends User {
  username: string;
}

async function createTestUser(authTest: TestHelpers) {
  const uniqueId = generateUniqueId();

  const draft = authTest.createUser({
    name: 'Test User',
    username: `test_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
  });

  const testUser = (await authTest.saveUser(draft)) as unknown as TestUser;
  return testUser;
}

export function setupTestContext() {
  let authTest: TestHelpers;
  let testUser: TestUser;

  beforeAll(async () => {
    const ctx = await auth.$context;
    authTest = ctx.test;
    testUser = await createTestUser(authTest);
  });

  afterAll(async () => {
    await authTest.deleteUser(testUser.id);
  });

  return {
    get authTest() {
      return authTest;
    },
    get testUser() {
      return testUser;
    },
  };
}
