import openapi from '@elysiajs/openapi';
import Elysia from 'elysia';

import { auth } from '@/lib/auth';
import { OpenAPI } from '../auth';

const app = new Elysia({ prefix: '/api' })
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .mount('/auth', auth.handler);

export type app = typeof app;

export const GET = app.handle;
export const POST = app.handle;
