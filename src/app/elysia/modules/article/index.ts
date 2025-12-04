import Elysia, { t } from 'elysia';

import { Ref } from '../utils';
import { ArticleModel } from './model';
import { Article } from './service';

export const article = new Elysia({ prefix: '/articles', tags: ['Articles'] })
  .model({
    Article: ArticleModel.articleResponse,
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
      case 'VALIDATION':
        return status(422, { message: error.message });
    }
  })
  .post(
    '',
    async ({ body }) => {
      return await Article.createArticle(body);
    },
    {
      body: ArticleModel.createArticleBody,
      response: {
        201: 'Article',
        404: ArticleModel.articleInvalid,
        422: ArticleModel.articleInvalid,
      },
    },
  )
  .get(
    '',
    async () => {
      return await Article.getArticles();
    },
    {
      response: {
        200: t.Array(Ref(ArticleModel.articleResponse)),
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
    '/:slug',
    async ({ params: { slug } }) => {
      return await Article.getArticle(slug);
    },
    {
      response: {
        200: 'Article',
        404: ArticleModel.articleInvalid,
      },
    },
  );
