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

describe('Article', () => {
  describe('Create article', () => {
    const createdArticles: string[] = [];

    afterEach(async () => {
      for (const publicId of createdArticles) {
        await cleanupTestArticle(publicId);
      }
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
      const { data, status } = await elysia.articles.post(
        {
          title: 'Test article',
          content: 'Test content',
          coverImage: 'https://example.com',
          status: 'draft',
        },
        { headers: testUser.headers },
      );

      expect(status).toBe(201);

      createdArticles.push(data?.publicId ?? '');
    });
  });

  describe('Get all articles', () => {
    test('return 200 and an array of published articles', async () => {
      const { data, status } = await elysia.articles.get();

      expect(status).toBe(200);
      expect(data).toBeInstanceOf(Array);

      if (data?.length === 0) {
        return;
      }

      expect(data?.every((article) => article.status === 'published')).toBe(
        true,
      );
    });
  });

  describe('Get article by publicId', () => {
    let testArticle: Awaited<ReturnType<typeof createTestArticle>>;

    beforeEach(async () => {
      testArticle = await createTestArticle(testUser.headers);
    });

    afterEach(async () => {
      await cleanupTestArticle(testArticle.publicId);
    });

    test('return 404 if article not found', async () => {
      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });

    test('return 200 and the article', async () => {
      const { data, status } = await elysia
        .articles({ publicId: testArticle.publicId })
        .get();

      expect(status).toBe(200);
      expect(data).not.toBeNull();
    });
  });

  describe('Update article', () => {
    let testArticle: Awaited<ReturnType<typeof createTestArticle>>;

    beforeEach(async () => {
      testArticle = await createTestArticle(testUser.headers);
    });

    afterEach(async () => {
      await cleanupTestArticle(testArticle.publicId);
    });

    test('return 404 if article does not exist', async () => {
      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .patch({ title: 'Test article' }, { headers: testUser.headers });

      expect(status).toBe(404);
    });

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia
        .articles({ publicId: testArticle.publicId })
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

      const { data, status } = await elysia
        .articles({ publicId: testArticle.publicId })
        .patch(body, { headers: testUser.headers });

      expect(status).toBe(200);
      expect(data).toMatchObject(body);
    });
  });

  describe('Delete article', () => {
    let testArticle: Awaited<ReturnType<typeof createTestArticle>>;

    beforeEach(async () => {
      testArticle = await createTestArticle(testUser.headers);
    });

    afterEach(async () => {
      await cleanupTestArticle(testArticle.publicId);
    });

    test('return 404 if article does not exist', async () => {
      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .delete({}, { headers: testUser.headers });

      expect(status).toBe(404);
    });

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia
        .articles({ publicId: testArticle.publicId })
        .delete();

      expect(status).toBe(401);
    });

    test('return 200 and verify that the article is deleted', async () => {
      const { status: deleteStatus } = await elysia
        .articles({ publicId: testArticle.publicId })
        .delete({}, { headers: testUser.headers });

      expect(deleteStatus).toBe(200);

      const { data, status: getStatus } = await elysia
        .articles({ publicId: testArticle.publicId })
        .get();

      expect(getStatus).toBe(404);
      expect(data).toBeNull();
    });
  });
});
