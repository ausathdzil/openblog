import { fromTypes, openapi } from '@elysiajs/openapi';
import Elysia from 'elysia';

import { article } from '../modules/article';
import { auth } from '../modules/auth';
import { author } from '../modules/author';
import { me } from '../modules/me';

export const app = new Elysia({ prefix: '/elysia' })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Peruere API',
          version: '1.0.0',
        },
      },
      references: fromTypes('src/app/elysia/[[...slugs]]/route.ts'),
    })
  )
  .use(auth)
  .use(article)
  .use(author)
  .use(me)
  .get('/', 'Hello, World!', { tags: ['Root'] });

export const GET = app.fetch;
export const POST = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
