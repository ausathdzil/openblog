import { describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import { setupTestArticle } from './setup-article';
import { setupAuthContext } from './setup-auth';

const authContext = setupAuthContext();

describe('Me', () => {
  describe('Article', () => {
    setupTestArticle(() => authContext.testUser.id);

    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.articles.get();

      expect(status).toBe(401);
    });

    test('return 200 and current user articles', async () => {
      const { data: articles, status } = await elysia.me.articles.get({
        headers: await authContext.authTest.getAuthHeaders({
          userId: authContext.testUser.id,
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
            article.author?.username === authContext.testUser.username
        )
      ).toBe(true);
    });
  });

  describe('Profile', () => {
    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.profile.patch({});

      expect(status).toBe(401);
    });

    test('return 200 and success message when updating profile', async () => {
      const { data, status } = await elysia.me.profile.patch(
        {
          bio: 'Test bio',
          twitter: '@testuser',
        },
        {
          headers: await authContext.authTest.getAuthHeaders({
            userId: authContext.testUser.id,
          }),
        }
      );

      expect(status).toBe(200);
      expect(data?.message).toBe('Profile updated.');
    });
  });
  describe('Avatar', () => {
    test('return 401 if not authenticated', async () => {
      const { status } = await elysia.me.avatar.delete({});

      expect(status).toBe(401);
    });

    test('return 200 and success message when deleting avatar', async () => {
      const { data, status } = await elysia.me.avatar.delete(
        {},
        {
          headers: await authContext.authTest.getAuthHeaders({
            userId: authContext.testUser.id,
          }),
        }
      );

      expect(status).toBe(200);
      expect(data?.message).toBe('Avatar removed.');
    });
  });
});
