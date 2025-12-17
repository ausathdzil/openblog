import { beforeAll, describe, expect, test } from 'bun:test';

import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';
import { extractCookies } from '../utils';

let authHeaders: HeadersInit;

beforeAll(async () => {
  const res = await auth.api.signInUsername({
    body: {
      username: 'john_doe',
      password: 'Password_123',
    },
    asResponse: true,
  });

  authHeaders = {
    cookie: extractCookies(res.headers),
  };
});

describe('Article controller', () => {
  describe('Create article', () => {
    test('should return 401 if not authenticated', async () => {
      const { status } = await elysia.articles.post({
        title: 'Test article',
        content: 'Test content',
        status: 'draft',
      });

      expect(status).toBe(401);
    });

    test('should return 201 and create an article', async () => {
      const { data, status: createStatus } = await elysia.articles.post(
        {
          title: 'Test article',
          content: 'Test content',
          status: 'draft',
        },
        { headers: authHeaders },
      );

      expect(createStatus).toBe(201);
      expect(data).toMatchObject({
        publicId: expect.any(String),
        title: 'Test article',
        content: 'Test content',
        status: 'draft',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        author: expect.any(Object),
        slug: expect.any(String),
        excerpt: expect.any(String),
      });
    });
  });

  describe('Get all articles', () => {
    test('should return an array of articles', async () => {
      const { data, status } = await elysia.articles.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    test.todo('should return empty array when no articles exist', () => {
      /**
       * TODO
       * - Get all articles
       * - Expect empty array
       * - Assert data is empty
       */
    });

    test('should return only published articles', async () => {
      const { data, status } = await elysia.articles.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      if (!data || data.length === 0) {
        return;
      }

      expect(data.every((article) => article.status === 'published')).toBe(
        true,
      );
    });

    test('should contain required fields', async () => {
      const { data } = await elysia.articles.get();

      if (!data || data.length === 0) {
        return;
      }

      const article = data[0];

      expect(article).toMatchObject({
        publicId: expect.any(String),
        status: 'published',
        title: expect.any(String),
        slug: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(article.author).not.toBeNull();

      expect(article.author).toMatchObject({
        name: expect.any(String),
        username: expect.any(String),
      });
    });
  });
});
