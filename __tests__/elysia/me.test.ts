import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { TestHelpers } from 'better-auth/plugins';

import { elysia } from '@/lib/eden';
import { createTestUser, getTestHelpers } from '../test-setup';
import { setupTestArticle } from './articles.utils';

let testHelpers: TestHelpers;
let testUser: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  testHelpers = await getTestHelpers();
  testUser = await createTestUser(testHelpers);
});

afterAll(async () => {
  await testHelpers.deleteUser(testUser.id);
});

describe('Me', () => {
  describe('Articles', () => {
    setupTestArticle(() => testUser.id);

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.articles.get();

      expect(status).toBe(401);
    });

    test('return 200 and current user articles', async () => {
      const { data: articles, status } = await elysia.me.articles.get({
        headers: await testHelpers.getAuthHeaders({ userId: testUser.id }),
      });

      expect(status).toBe(200);
      expect(articles).not.toBeNull();
      expect(articles?.data).toBeArray();

      if (articles?.data.length === 0) {
        return;
      }

      expect(
        articles?.data.every(
          (article) => article.author?.username === testUser.username
        )
      ).toBe(true);
    });
  });
});
