import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from 'bun:test';

import { elysia } from '@/lib/eden';
import {
  cleanupTestArticle,
  cleanupTestUser,
  createTestUser,
  type TestUser,
} from '../utils';

let testUser: TestUser;

beforeAll(async () => {
  testUser = await createTestUser();
});

afterAll(async () => {
  await cleanupTestUser(testUser.data.username);
});

describe('Article controller', () => {
  describe('Create article', () => {
    const createdArticles: string[] = [];

    afterEach(async () => {
      for (const publicId of createdArticles) {
        await cleanupTestArticle(publicId);
      }
      createdArticles.length = 0;
    });

    test('should return 401 if not authenticated', async () => {
      const { status } = await elysia.articles.post({
        title: 'Test article',
        content: 'Test content',
        status: 'draft',
      });

      expect(status).toBe(401);
    });

    test('should return 201 and create an article', async () => {
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
    test('should return an array of articles', async () => {
      const { data, status } = await elysia.articles.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    test('should return only published articles', async () => {
      const { data, status } = await elysia.articles.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      if (data?.length === 0) {
        return;
      }

      expect(data?.every((article) => article.status === 'published')).toBe(
        true,
      );
    });
  });

  describe.todo('Get article by publicId', () => {
    test('should return 404 if article not found', async () => {
      const { status } = await elysia
        .articles({ publicId: 'non-existent' })
        .get();

      expect(status).toBe(404);
    });
  });
});
