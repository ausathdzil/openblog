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

describe('Author', () => {
  describe('Get all authors', () => {
    test('return 200 and an array of authors', async () => {
      const { data: authors, status } = await elysia.authors.get();

      expect(status).toBe(200);
      expect(authors).not.toBeNull();
      expect(authors?.data).toBeArray();
    });
  });

  describe('Get author by username', () => {
    test('return 404 if author not found', async () => {
      const { status } = await elysia
        .authors({ username: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the author', async () => {
      const { data, status } = await elysia
        .authors({ username: testUser.username })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });

  describe('Get author articles', () => {
    setupTestArticle(() => testUser.id);

    test('return 404 if author not found', async () => {
      const { status } = await elysia
        .authors({ username: 'non-existent' })
        .articles.get();

      expect(status).toBe(404);
    });

    test('return 200 and an array of articles', async () => {
      const { data: articles, status } = await elysia
        .authors({ username: testUser.username })
        .articles.get();

      expect(status).toBe(200);
      expect(articles).not.toBeNull();
      expect(articles?.data).toBeArray();

      if (articles?.data.length === 0) {
        return;
      }

      expect(
        articles?.data.every((article) => article.status === 'published')
      ).toBe(true);
    });
  });

  describe('Get author article by slug', () => {
    const ctx = setupTestArticle(() => testUser.id);

    test('return 404 if article not found', async () => {
      const { status } = await elysia
        .authors({ username: testUser.username })
        .articles({ slug: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the article', async () => {
      const article = ctx.article;

      const { data, status } = await elysia
        .authors({ username: testUser.username })
        .articles({ slug: article.slug ?? '' })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });
});
