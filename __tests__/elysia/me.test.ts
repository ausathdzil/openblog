import { describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import { setupTestContext } from '../test-setup';
import { setupTestArticle } from './articles.utils';

const testContext = setupTestContext();

describe('Me', () => {
  describe('Articles', () => {
    setupTestArticle(() => testContext.testUser.id);

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.articles.get();

      expect(status).toBe(401);
    });

    test('return 200 and current user articles', async () => {
      const { data: articles, status } = await elysia.me.articles.get({
        headers: await testContext.authTest.getAuthHeaders({
          userId: testContext.testUser.id,
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
            article.author?.username === testContext.testUser.username
        )
      ).toBe(true);
    });
  });
});
