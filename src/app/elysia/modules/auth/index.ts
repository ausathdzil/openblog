import { Elysia } from 'elysia';

import { auth as betterAuth } from '@/lib/auth';

export class AuthError extends Error {
  status: number;

  constructor(
    public message: string,
    status = 401,
  ) {
    super(message);
    this.status = status;
  }
}

export const auth = new Elysia({ prefix: '/auth', name: 'better-auth' })
  .mount(betterAuth.handler)
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await betterAuth.api.getSession({
          headers,
        });

        if (!session) {
          throw new AuthError('You are unauthorized to access this resource');
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
