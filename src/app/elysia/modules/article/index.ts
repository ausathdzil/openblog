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
  .post(
    '/',
    async ({ body }) => {
      return await Article.createArticle(body);
    },
    {
      body: ArticleModel.createArticleBody,
      response: {
        201: ArticleModel.createArticleResponse,
      },
    },
  );
