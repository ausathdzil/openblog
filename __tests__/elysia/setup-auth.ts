import { afterAll, beforeAll } from 'bun:test';
import type { TestHelpers } from 'better-auth/plugins';
import type { User } from 'better-auth/types';

import { auth, generateUniqueId } from '../auth';

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

export function setupAuthContext() {
  let authTest: TestHelpers | null = null;
  let testUser: TestUser | null = null;

  const requireContext = () => {
    if (!(authTest && testUser)) {
      throw new Error('Auth context is not set up yet');
    }
    return { authTest, testUser };
  };

  beforeAll(async () => {
    const ctx = await auth.$context;
    authTest = ctx.test;
    testUser = await createTestUser(authTest);
  });

  afterAll(async () => {
    if (authTest && testUser) {
      await authTest.deleteUser(testUser.id);
      testUser = null;
    }
  });

  return {
    get authTest() {
      return requireContext().authTest;
    },
    get testUser() {
      return requireContext().testUser;
    },
  };
}
