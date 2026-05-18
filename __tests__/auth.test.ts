/**
 * Duplicated from `src/lib/auth.ts` with `testUtils()` for integration tests only.
 * @see https://better-auth.com/docs/plugins/test-utils
 */
import { describe, expect, test } from 'bun:test';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { testUtils, username } from 'better-auth/plugins';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { usernameRegex } from '@/lib/auth';

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

describe('Auth', () => {
  test('exposes test utils', async () => {
    const ctx = await auth.$context;

    expect(ctx.test).toBeDefined();
  });

  test('validates usernames with configured regex', () => {
    expect(usernameRegex.test('valid_name')).toBe(true);
    expect(usernameRegex.test('.invalid')).toBe(false);
  });
});
