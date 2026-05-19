import { afterAll, beforeAll } from 'bun:test';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import type { TestHelpers } from 'better-auth/plugins';
import { testUtils, username } from 'better-auth/plugins';
import type { User } from 'better-auth/types';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { usernameRegex } from '@/lib/auth';

/**
 * Duplicated from `src/lib/auth.ts` with `testUtils()` for integration tests only.
 * @see https://better-auth.com/docs/plugins/test-utils
 */
export const auth = betterAuth({
  basePath: '/api',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      usernameValidator: (username) => usernameRegex.test(username),
    }),
    testUtils(),
  ],
});

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

export function setupAuthContext() {
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
