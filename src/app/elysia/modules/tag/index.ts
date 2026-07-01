import { Elysia } from 'elysia';

import { getTagBySlug, getTags } from './service';

export const tag = new Elysia({ prefix: '/tags', tags: ['Tags'] })
  .get('/', async () => await getTags())
  .get('/:slug', async ({ params: { slug } }) => await getTagBySlug(slug));
