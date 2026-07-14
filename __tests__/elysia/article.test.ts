import { afterEach, describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import {
  cleanupTestArticle,
  cleanupTestArticleTags,
  setupTestArticle,
} from './setup-article';
import { setupAuthContext } from './setup-auth';

const authContext = setupAuthContext();
const secondaryAuthContext = setupAuthContext();

describe('Article', () => {
  describe('Create article', () => {
    const createdArticles: string[] = [];
    const createdTags: string[] = [];

    afterEach(async () => {
      await Promise.all(
        createdArticles.map((publicId) => cleanupTestArticle(publicId))
      );
      await Promise.all(
        createdTags.map((slug) => cleanupTestArticleTags(slug))
      );
      createdArticles.length = 0;
      createdTags.length = 0;
    });

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.articles.post({
        title: 'Test article',
        status: 'draft',
      });

      expect(status).toBe(401);
    });

    test('return 201 and create an article', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const { data, status } = await elysia.articles.post(
        {
          title: 'Test article',
          coverImage: 'https://example.com',
          status: 'draft',
        },
        { headers }
      );

      expect(status).toBe(201);
      expect(data).not.toBeNull();
      expect(data?.publicId).toBeString();

      if (data?.publicId) {
        createdArticles.push(data.publicId);
      }
    });

    test('return 201 and create an article with tags', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const { data, status } = await elysia.articles.post(
        {
          title: 'Test article with tags',
          status: 'draft',
          tags: ['test-tag-1', 'test-tag-2'],
        },
        { headers }
      );

      expect(status).toBe(201);
      expect(data).not.toBeNull();
      expect(data?.tags).toBeArray();
      expect(data?.tags?.length).toBe(2);
      expect(data?.tags?.map((t: any) => t.name)).toContain('test-tag-1');

      if (data?.publicId) {
        createdArticles.push(data.publicId);
      }

      if (data?.tags) {
        createdTags.push(...data.tags.map((t: any) => t.slug));
      }
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
    const ctx = setupTestArticle(() => authContext.testUser.id);

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
    const ctx = setupTestArticle(() => authContext.testUser.id);

    test('return 404 if article does not exist', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
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

    test('return 403 if user is not the author', async () => {
      const article = ctx.article;

      // Get headers for a DIFFERENT user
      const headers = await secondaryAuthContext.authTest.getAuthHeaders({
        userId: secondaryAuthContext.testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ title: 'Hacked Title' }, { headers });

      expect(status).toBe(403);
    });

    test('return 200 and update the article', async () => {
      const body = {
        title: 'Test update',
        coverImage: null,
        status: 'draft' as 'draft' | 'published' | 'archived' | undefined,
      };

      const article = ctx.article;

      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .patch(body, { headers });

      expect(status).toBe(200);
      expect(data).toMatchObject(body);
    });

    test('does not regenerate slug when title is updated and article is published', async () => {
      const article = ctx.article;
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ title: 'New Title For Published' }, { headers });

      expect(status).toBe(200);
      expect(data?.slug).toBe(article.slug);
    });

    test('regenerates slug when title is updated and article is a draft', async () => {
      const article = ctx.article;
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      await elysia
        .articles({ publicId: article.publicId })
        .patch({ status: 'draft' }, { headers });

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ title: 'New Title For Draft' }, { headers });

      expect(status).toBe(200);
      expect(data?.slug).not.toBe(article.slug);
      expect(data?.slug).toInclude('new-title-for-draft');
    });

    test('updates tags correctly', async () => {
      const article = ctx.article;
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const { data, status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ tags: ['updated-tag-1'] }, { headers });

      expect(status).toBe(200);
      expect(data?.tags).toBeArray();
      expect(data?.tags?.length).toBe(1);
      expect(data?.tags?.[0]?.name).toBe('updated-tag-1');
    });
  });

  describe('Delete article', () => {
    const ctx = setupTestArticle(() => authContext.testUser.id);

    test('return 404 if article does not exist', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
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

    test('return 403 if user is not the author', async () => {
      const article = ctx.article;

      // Get headers for a DIFFERENT user
      const headers = await secondaryAuthContext.authTest.getAuthHeaders({
        userId: secondaryAuthContext.testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .delete({}, { headers });

      expect(status).toBe(403);
    });

    test('return 200 and verify that the article is deleted', async () => {
      const article = ctx.article;
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
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
