import Elysia, { t } from 'elysia';

import { AuthError, auth } from '../auth';
import { Ref } from '../utils';
import { ArticleModel } from './model';
import { Article } from './service';

export const article = new Elysia({ prefix: '/articles', tags: ['Articles'] })
  .use(auth)
  .model({
    Article: ArticleModel.articleResponse,
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'VALIDATION':
        return status(422, { message: error.message });
    }
  })
  .post(
    '',
    async ({ body, user }) => {
      return await Article.createArticle(body, user.username ?? '');
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
      return await Article.getArticles(query);
    },
    {
      query: t.Omit(ArticleModel.articlesQuery, ['status', 'authorId']),
      response: {
        200: t.Array(Ref(ArticleModel.articleResponse)),
      },
    },
  )
  .error({
    AuthError,
  })
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
      case 'AuthError':
        return status(error.status, { message: error.message });
    }
  })
  .get(
    '/:publicId',
    async ({ params: { publicId } }) => {
      return await Article.getArticle(publicId);
    },
    {
      response: {
        200: 'Article',
        404: ArticleModel.articleInvalid,
      },
    },
  )
  .patch(
    '/:publicId',
    async ({ params: { publicId }, body, user }) => {
      return await Article.updateArticle(publicId, body, user.id);
    },
    {
      auth: true,
      body: t.Omit(ArticleModel.updateArticleBody, ['slug', 'excerpt']),
      response: {
        200: 'Article',
        401: ArticleModel.articleInvalid,
        404: ArticleModel.articleInvalid,
      },
    },
  )
  .delete(
    '/:publicId',
    async ({ params: { publicId }, user }) => {
      return await Article.deleteArticle(publicId, user.id);
    },
    {
      auth: true,
      response: {
        200: ArticleModel.articleInvalid,
        401: ArticleModel.articleInvalid,
        404: ArticleModel.articleInvalid,
      },
    },
  )
  .get(
    '/drafts',
    async ({ user }) => {
      return await Article.getDrafts(user.id);
    },
    {
      auth: true,
      response: {
        200: t.Array(Ref(ArticleModel.articleResponse)),
        401: ArticleModel.articleInvalid,
      },
    },
  );
