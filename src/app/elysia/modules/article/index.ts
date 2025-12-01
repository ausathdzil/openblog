import Elysia from 'elysia';
import { ArticleModel } from './model';
import { Article } from './service';

export const article = new Elysia({ prefix: '/articles', tags: ['Articles'] })
  .get(
    '/',
    async () => {
      return await Article.getArticles();
    },
    {
      response: {
        200: ArticleModel.getArticlesResponse,
      },
    },
  )
  .onError(({ code, status, error }) => {
    switch (code) {
      case 'NOT_FOUND':
        return status(404, { message: error.message });
      case 'VALIDATION':
        return status(422, { message: error.message });
      case 'INTERNAL_SERVER_ERROR':
        return status(500, { message: error.message });
    }
  })
  .post(
    '/',
    async ({ body }) => {
      return await Article.createArticle(body);
    },
    {
      body: ArticleModel.createArticleBody,
      response: {
        201: ArticleModel.createArticleResponse,
        404: ArticleModel.createArticleInvalid,
        422: ArticleModel.createArticleInvalid,
        500: ArticleModel.createArticleInvalid,
      },
    },
  );
