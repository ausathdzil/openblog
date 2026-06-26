import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth/minimal';
import { testUtils, username } from 'better-auth/plugins';

import { db } from '@/db';
import * as schema from '@/db/schema';

/**
 * Duplicated from `src/lib/auth.ts` with `testUtils()` for integration tests only.
 * @see https://better-auth.com/docs/plugins/test-utils
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/elysia/auth/api',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  plugins: [
    username({
      /**
       * Username can only contain letters, numbers, underscores, and dots,
       * can't start with a number,
       * can't start or end with a dot,
       * and can't contain consecutive dots.
       */
      usernameValidator: (username) =>
        /^(?![0-9])(?!\.)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]+$/.test(username),
    }),
    testUtils(),
  ],
});

export function generateUniqueId() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}
