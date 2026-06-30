import { openapi } from '@elysiajs/openapi';
import Elysia from 'elysia';

import { article } from '../modules/article';
import { auth } from '../modules/auth';
import { author } from '../modules/author';
import { me } from '../modules/me';
import { tag } from '../modules/tag';

export const app = new Elysia({ prefix: '/elysia' })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'OpenBlog API',
          version: '1.0.0',
        },
      },
    })
  )
  .use(auth)
  .use(article)
  .use(author)
  .use(me)
  .use(tag)
  .get('/', 'Hello, World!', { tags: ['Root'] });

export const GET = app.fetch;
export const POST = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
