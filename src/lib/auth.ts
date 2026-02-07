import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { nextCookies } from 'better-auth/next-js';
import { openAPI, username } from 'better-auth/plugins';

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
    openAPI(),
    username({
      usernameValidator: (username) => {
        return usernameRegex.test(username);
      },
    }),
    nextCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
