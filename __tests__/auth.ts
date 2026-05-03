/**
 * Duplicated from `src/lib/auth.ts` with `testUtils()` for integration tests only.
 * @see https://better-auth.com/docs/plugins/test-utils
 */
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { testUtils, username } from 'better-auth/plugins';

import { db } from '@/db';
import * as schema from '@/db/schema';

/**
 * Username can only contain letters, numbers, underscores, and dots,
 * can't start with a number,
 * can't start or end with a dot,
 * and can't contain consecutive dots.
 */
const usernameRegex = /^(?![0-9])(?!\.)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]+$/;

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
