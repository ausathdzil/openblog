import { treaty } from '@elysiajs/eden';

import type { app } from '@/app/elysia/[[...slugs]]/route';

export const elysia = treaty<typeof app>('localhost:3000').elysia;
