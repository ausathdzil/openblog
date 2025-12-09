import Elysia, { t } from 'elysia';

import { Ref } from '../utils';
import { AuthorModel } from './model';
import { Author } from './service';

export const author = new Elysia({ prefix: '/authors', tags: ['Authors'] })
  .model({
    Author: AuthorModel.authorResponse,
  })
  .get(
    '',
    async () => {
      return await Author.getAuthors();
    },
    {
      response: {
        200: t.Array(Ref(AuthorModel.authorResponse)),
      },
    },
  )
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
    }
  })
  .get(
    '/:handle',
    async ({ params: { handle } }) => {
      return await Author.getAuthor(handle);
    },
    {
      response: {
        200: 'Author',
        404: AuthorModel.authorInvalid,
      },
    },
  );
