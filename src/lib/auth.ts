import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { getAuthenticatorName, passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth/minimal';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP, openAPI, username } from 'better-auth/plugins';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { resend } from './resend';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/elysia/auth/api',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  user: {
    additionalFields: {
      bio: { type: 'string', required: false },
      website: { type: 'string', required: false },
      twitter: { type: 'string', required: false },
      facebook: { type: 'string', required: false },
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    openAPI(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const typeMap = {
          'sign-in': 'Sign In',
          'email-verification': 'Email Verification',
          'forget-password': 'Password Reset',
          'change-email': 'Change Email',
        } as const;

        const normalizedType =
          typeMap[type as keyof typeof typeMap] || 'Verification';

        await resend.emails.send({
          from: 'OpenBlog <noreply@openblog.ausathikram.com>',
          to: email,
          subject: `${otp} is your OpenBlog verification code`,
          template: {
            id: 'one-time-password',
            variables: {
              otp,
              type: normalizedType,
            },
          },
        });
      },
    }),
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
    passkey({
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'localhost',
      rpName: 'OpenBlog',
      registration: {
        afterVerification: async ({ verification }) => ({
          name: getAuthenticatorName(verification.registrationInfo?.aaguid),
        }),
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
