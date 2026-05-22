import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { testUtils, username } from 'better-auth/plugins';

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

export function generateUniqueId() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}
