import { treaty } from '@elysiajs/eden';

import { app } from '@/app/elysia/[[...slugs]]/route';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const elysia =
  typeof process !== 'undefined'
    ? treaty(app).elysia
    : treaty<typeof app>(baseUrl).elysia;
