import { describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import { setupAuthContext } from '../auth.utils';
import { setupTestArticle } from './article.utils';

const authContext = setupAuthContext();

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
        .authors({ username: authContext.testUser.username })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });

  describe('Get author articles', () => {
    setupTestArticle(() => authContext.testUser.id);

    test('return 404 if author not found', async () => {
      const { status } = await elysia
        .authors({ username: 'non-existent' })
        .articles.get();

      expect(status).toBe(404);
    });

    test('return 200 and an array of articles', async () => {
      const { data: articles, status } = await elysia
        .authors({ username: authContext.testUser.username })
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
    const ctx = setupTestArticle(() => authContext.testUser.id);

    test('return 404 if article not found', async () => {
      const { status } = await elysia
        .authors({ username: authContext.testUser.username })
        .articles({ slug: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the article', async () => {
      const article = ctx.article;

      const { data, status } = await elysia
        .authors({ username: authContext.testUser.username })
        .articles({ slug: article.slug ?? '' })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });
});
