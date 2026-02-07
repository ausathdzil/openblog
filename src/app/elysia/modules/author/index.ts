import Elysia, { t } from 'elysia';

import { ArticleModel } from '../article/model';
import * as ArticleService from '../article/service';
import { AuthorModel } from './model';
import * as AuthorService from './service';

export const author = new Elysia({ prefix: '/authors', tags: ['Authors'] })
  .model({
    Author: AuthorModel.authorResponse,
    Authors: AuthorModel.authorsResponse,
    Article: ArticleModel.articleResponse,
    Articles: ArticleModel.articlesResposnse,
  })
  .get(
    '',
    async ({ query }) => {
      return await AuthorService.getAuthors(query);
    },
    {
      query: AuthorModel.authorsQuery,
      response: {
        200: 'Authors',
      },
    }
  )
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
    }
  })
  .get(
    '/:username',
    async ({ params }) => {
      return await AuthorService.getAuthorByUsername(params.username);
    },
    {
      response: {
        200: 'Author',
        404: AuthorModel.authorInvalid,
      },
    }
  )
  .get(
    '/:username/articles',
    async ({ params, query }) => {
      return await ArticleService.getArticles(query, params.username);
    },
    {
      query: t.Omit(ArticleModel.articlesQuery, ['status']),
      response: {
        200: 'Articles',
        404: AuthorModel.authorInvalid,
      },
    }
  )
  .get(
    '/:username/articles/:slug',
    async ({ params }) => {
      return await ArticleService.getArticleBySlug(
        params.slug,
        params.username
      );
    },
    {
      response: {
        200: 'Article',
        404: ArticleModel.articleInvalid,
      },
    }
  );
