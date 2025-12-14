import { openapi } from '@elysiajs/openapi';
import Elysia from 'elysia';

import { article } from '../modules/article';
import { auth } from '../modules/auth';
import { author } from '../modules/author';
import { BetterAuthOpenAPI } from '../modules/utils';

export const app = new Elysia({ prefix: '/elysia' })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Peruere API',
          version: '1.0.0',
        },
        components: await BetterAuthOpenAPI.components,
        paths: await BetterAuthOpenAPI.getPaths(),
      },
    }),
  )
  .use(auth)
  .use(article)
  .use(author);

export const GET = app.fetch;
export const POST = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
