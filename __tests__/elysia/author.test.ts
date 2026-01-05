import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test';

import { elysia } from '@/lib/eden';
import {
  cleanupTestArticle,
  cleanupTestUser,
  createTestArticle,
  createTestUser,
} from '../utils';

let testUser: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  testUser = await createTestUser();
});

afterAll(async () => {
  await cleanupTestUser(testUser.data.username);
});

describe('Author', () => {
  describe('Get all authors', () => {
    test('return 200 and an array of authors', async () => {
      const { data: authors, status } = await elysia.authors.get();

      expect(status).toBe(200);
      expect(authors).toBeArray();
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
        .authors({ username: testUser.data.username })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });

  describe('Get author articles', () => {
    let testArticle: Awaited<ReturnType<typeof createTestArticle>>;

    beforeEach(async () => {
      testArticle = await createTestArticle(testUser.headers);
    });

    afterEach(async () => {
      await cleanupTestArticle(testArticle.publicId);
    });

    test('return 404 if author not found', async () => {
      const { status } = await elysia
        .authors({ username: 'non-existent' })
        .articles.get();

      expect(status).toBe(404);
    });

    test('return 200 and an array of articles', async () => {
      const { data: articles, status } = await elysia
        .authors({ username: testUser.data.username })
        .articles.get();

      expect(status).toBe(200);
      expect(articles).not.toBeNull();
      expect(articles?.data).toBeArray();

      if (articles?.data.length === 0) {
        return;
      }

      expect(
        articles?.data.every((article) => article.status === 'published'),
      ).toBe(true);
    });
  });

  describe('Get author article by slug', () => {
    let testArticle: Awaited<ReturnType<typeof createTestArticle>>;

    beforeEach(async () => {
      testArticle = await createTestArticle(testUser.headers);
    });

    afterEach(async () => {
      await cleanupTestArticle(testArticle.publicId);
    });

    test('return 404 if article not found', async () => {
      const { status } = await elysia
        .authors({ username: testUser.data.username })
        .articles({ slug: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the article', async () => {
      const { data, status } = await elysia
        .authors({ username: testUser.data.username })
        .articles({ slug: testArticle.slug ?? '' })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });
});
