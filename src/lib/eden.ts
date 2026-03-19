import { treaty } from '@elysiajs/eden';

import { app } from '@/app/elysia/[[...slugs]]/route';

export const elysia =
  typeof process === 'undefined'
    ? treaty<typeof app>('localhost:3000').elysia
    : treaty(app).elysia;
