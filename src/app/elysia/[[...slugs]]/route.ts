import { openapi } from '@elysiajs/openapi';
import Elysia from 'elysia';

import { auth } from '@/lib/auth';
import { article } from '../modules/article';

const app = new Elysia({ prefix: '/elysia' })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Peruere API',
          version: '1.0.0',
        },
      },
    }),
  )
  .use(article)
  .mount('/auth', auth.handler)
  .get('/', 'Hello, World!', { tags: ['Root'] });

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
