import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from 'bun:test';
import type { TestHelpers } from 'better-auth/plugins';

import { elysia } from '@/lib/eden';
import { createTestUser, getTestHelpers } from '../test-setup';
import { cleanupTestArticle, setupTestArticle } from './articles.utils';

let testHelpers: TestHelpers;
let testUser: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  testHelpers = await getTestHelpers();
  testUser = await createTestUser(testHelpers);
});

afterAll(async () => {
  await testHelpers.deleteUser(testUser.id);
});

describe('Article', () => {
  describe('Create article', () => {
    const createdArticles: string[] = [];

    afterEach(async () => {
      await Promise.all(
        createdArticles.map((publicId) => cleanupTestArticle(publicId))
      );
      createdArticles.length = 0;
    });

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.articles.post({
        title: 'Test article',
        content: 'Test content',
        status: 'draft',
      });

      expect(status).toBe(401);
    });

    test('return 201 and create an article', async () => {
      const headers = await testHelpers.getAuthHeaders({
        userId: testUser.id,
      });

      const { data, status } = await elysia.articles.post(
        {
          title: 'Test article',
          content: 'Test content',
          coverImage: 'https://example.com',
          status: 'draft',
        },
        { headers }
      );

      expect(status).toBe(201);

      createdArticles.push(data?.publicId ?? '');
    });
  });

  describe('Get all articles', () => {
    test('return 200 and an array of published articles', async () => {
      const { data: articles, status } = await elysia.articles.get();

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

  describe('Get article by publicId', () => {
    const ctx = setupTestArticle(() => testUser.id);

    test('return 404 if article not found', async () => {
      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the article', async () => {
      const article = ctx.article;

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });

  describe('Update article', () => {
    const ctx = setupTestArticle(() => testUser.id);

    test('return 404 if article does not exist', async () => {
      const headers = await testHelpers.getAuthHeaders({
        userId: testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .patch({ title: 'Test article' }, { headers });

      expect(status).toBe(404);
    });

    test('return 401 if not authenticated', async () => {
      const article = ctx.article;

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ title: 'Test article' });

      expect(status).toBe(401);
    });

    test('return 200 and update the article', async () => {
      const body = {
        title: 'Test update',
        content: 'Test content',
        coverImage: null,
        status: 'draft' as 'draft' | 'published' | 'archived' | undefined,
      };

      const article = ctx.article;

      const headers = await testHelpers.getAuthHeaders({
        userId: testUser.id,
      });

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .patch(body, { headers });

      expect(status).toBe(200);
      expect(data).toMatchObject(body);
    });
  });

  describe('Delete article', () => {
    const ctx = setupTestArticle(() => testUser.id);

    test('return 404 if article does not exist', async () => {
      const headers = await testHelpers.getAuthHeaders({
        userId: testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .delete({}, { headers });

      expect(status).toBe(404);
    });

    test('return 401 if not authenticated', async () => {
      const article = ctx.article;

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .delete();

      expect(status).toBe(401);
    });

    test('return 200 and verify that the article is deleted', async () => {
      const article = ctx.article;
      const headers = await testHelpers.getAuthHeaders({
        userId: testUser.id,
      });

      const { status: deleteStatus } = await elysia
        .articles({ publicId: article.publicId })
        .delete({}, { headers });

      expect(deleteStatus).toBe(200);

      const { data, status: getStatus } = await elysia
        .articles({ publicId: article.publicId })
        .get();

      expect(getStatus).toBe(404);
      expect(data).toBeNull();
    });
  });
});
