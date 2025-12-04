import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { openAPI, username } from 'better-auth/plugins';

import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
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
        return /^(?![0-9])(?!\.)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]+$/.test(
          username,
        );
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
