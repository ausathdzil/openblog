import Elysia, { t } from 'elysia';

import { ArticleModel } from '../article/model';
import { Article } from '../article/service';
import { Ref } from '../utils';
import { AuthorModel } from './model';
import { Author } from './service';

export const author = new Elysia({ prefix: '/authors', tags: ['Authors'] })
  .model({
    Author: AuthorModel.authorResponse,
    Article: ArticleModel.articleResponse,
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
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
    }
  })
  .get(
    '/:username',
    async ({ params }) => {
      return await Author.getAuthor(params.username);
    },
    {
      response: {
        200: 'Author',
        404: AuthorModel.authorInvalid,
      },
    },
  )
  .get(
    '/:username/articles',
    async ({ params, query }) => {
      return await Article.getArticles(query, params.username);
    },
    {
      query: t.Pick(ArticleModel.articlesQuery, ['q']),
      response: {
        200: t.Array(Ref(ArticleModel.articleResponse)),
        404: AuthorModel.authorInvalid,
      },
    },
  )
  .get(
    '/:username/articles/:slug',
    async ({ params }) => {
      return await Article.getArticleBySlug(params.slug, params.username);
    },
    {
      response: {
        200: 'Article',
        404: ArticleModel.articleInvalid,
      },
    },
  );
