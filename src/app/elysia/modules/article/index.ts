import Elysia, { t } from 'elysia';

import { AuthError, auth } from '../auth';
import { ArticleModel } from './model';
import * as ArticleService from './service';

export const article = new Elysia({ prefix: '/articles', tags: ['Articles'] })
  .use(auth)
  .model({
    Article: ArticleModel.articleResponse,
    Articles: ArticleModel.articlesResposnse,
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
  .post(
    '',
    async ({ body, set, user }) => {
      const article = await ArticleService.createArticle(body, user?.id);
      set.status = 201;
      return article;
    },
    {
      auth: true,
      body: ArticleModel.createArticleBody,
      response: {
        201: 'Article',
        401: ArticleModel.articleInvalid,
        422: ArticleModel.articleInvalid,
      },
    },
  )
  .get(
    '',
    async ({ query }) => {
      return await ArticleService.getArticles(query);
    },
    {
      query: t.Omit(ArticleModel.articlesQuery, ['status']),
      response: {
        200: 'Articles',
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
    '/:publicId',
    async ({ params, user }) => {
      return await ArticleService.getArticleByPublicId(
        params.publicId,
        user?.id,
      );
    },
    {
      auth: true,
      response: {
        200: 'Article',
        403: ArticleModel.articleInvalid,
        404: ArticleModel.articleInvalid,
      },
    },
  )
  .patch(
    '/:publicId',
    async ({ params, body, user }) => {
      return await ArticleService.updateArticle(
        params.publicId,
        body,
        user?.id,
      );
    },
    {
      auth: true,
      body: t.Omit(ArticleModel.updateArticleBody, ['slug', 'excerpt']),
      response: {
        200: 'Article',
        401: ArticleModel.articleInvalid,
        403: ArticleModel.articleInvalid,
        404: ArticleModel.articleInvalid,
      },
    },
  )
  .delete(
    '/:publicId',
    async ({ params, user }) => {
      return await ArticleService.deleteArticle(params.publicId, user?.id);
    },
    {
      auth: true,
      response: {
        200: ArticleModel.articleInvalid,
        401: ArticleModel.articleInvalid,
        403: ArticleModel.articleInvalid,
        404: ArticleModel.articleInvalid,
      },
    },
  );
