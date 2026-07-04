import { Elysia } from 'elysia';

import { tagInvalid, tagResponse, tagsResponse } from './model';
import { getTagBySlug, getTags } from './service';

export const tag = new Elysia({ prefix: '/tags', tags: ['Tags'] })
  .model({
    Tag: tagResponse,
    Tags: tagsResponse,
  })
  .get('/', async () => await getTags(), {
    response: {
      200: 'Tags',
    },
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
    }
  })
  .get('/:slug', async ({ params: { slug } }) => await getTagBySlug(slug), {
    response: {
      200: 'Tag',
      404: tagInvalid,
    },
  });
