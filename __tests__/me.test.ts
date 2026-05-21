import { describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import { setupTestArticle } from './article.utils';
import { setupAuthContext } from './auth.utils';

const authContext = setupAuthContext();

describe('Me', () => {
  describe('Articles', () => {
    setupTestArticle(() => authContext.testUser.id);

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.articles.get();

      expect(status).toBe(401);
    });

    test('return 200 and current user articles', async () => {
      const { data: articles, status } = await elysia.me.articles.get({
        headers: await authContext.authTest.getAuthHeaders({
          userId: authContext.testUser.id,
        }),
      });

      expect(status).toBe(200);
      expect(articles).not.toBeNull();
      expect(articles?.data).toBeArray();

      if (articles?.data.length === 0) {
        return;
      }

      expect(
        articles?.data.every(
          (article) =>
            article.author?.username === authContext.testUser.username
        )
      ).toBe(true);
    });
  });
});
