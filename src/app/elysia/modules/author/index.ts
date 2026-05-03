import Elysia, { t } from 'elysia';

import {
  articleInvalid,
  articleResponse,
  articlesQuery,
  articlesResposnse,
} from '../article/model';
import { getArticleBySlug, getArticles } from '../article/service';
import {
  authorInvalid,
  authorResponse,
  authorsQuery,
  authorsResponse,
} from './model';
import { getAuthorByUsername, getAuthors } from './service';

export const author = new Elysia({ prefix: '/authors', tags: ['Authors'] })
  .model({
    Author: authorResponse,
    Authors: authorsResponse,
    Article: articleResponse,
    Articles: articlesResposnse,
  })
  .get('', async ({ query }) => await getAuthors(query), {
    query: authorsQuery,
    response: {
      200: 'Authors',
    },
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
    }
  })
  .get(
    '/:username',
    async ({ params }) => await getAuthorByUsername(params.username),
    {
      response: {
        200: 'Author',
        404: authorInvalid,
      },
    }
  )
  .get(
    '/:username/articles',
    async ({ params, query }) => await getArticles(query, params.username),
    {
      query: t.Omit(articlesQuery, ['status']),
      response: {
        200: 'Articles',
        404: authorInvalid,
      },
    }
  )
  .get(
    '/:username/articles/:slug',
    async ({ params }) => await getArticleBySlug(params.slug, params.username),
    {
      response: {
        200: 'Article',
        404: articleInvalid,
      },
    }
  );
