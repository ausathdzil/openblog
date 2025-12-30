import Elysia, { t } from 'elysia';

import { ArticleModel } from '../article/model';
import * as ArticleService from '../article/service';
import { AuthError, auth } from '../auth';
import { Ref } from '../utils';

export const me = new Elysia({ prefix: '/me', tags: ['Me'] })
  .use(auth)
  .model({
    Article: ArticleModel.articleResponse,
  })
  .error({
    AuthError,
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'AuthError':
        return status(error.status, { message: error.message });
    }
  })
  .get(
    '/articles',
    async ({ query, user }) => {
      if (!user) {
        throw new AuthError('You are not allowed to access this resource');
      }

      return await ArticleService.getArticles(query, user.username);
    },
    {
      auth: true,
      query: ArticleModel.articlesQuery,
      response: {
        200: t.Array(Ref(ArticleModel.articleResponse)),
        401: ArticleModel.articleInvalid,
      },
    },
  );
