import { describe, expect, test } from 'bun:test';

import { elysia } from '@/lib/eden';
import { setupTestTag } from './setup-tag';

describe('Tag', () => {
  const tagContext = setupTestTag('Test Tag API', 'test-tag-api');

  describe('Get all tags', () => {
    test('return 200 and an array of tags', async () => {
      const { data, status } = await elysia.tags.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);

      const testTag = data?.find((t: any) => t.slug === tagContext.tag.slug);
      expect(testTag).toBeDefined();
      expect(testTag?.name).toBe(tagContext.tag.name);
    });
  });

  describe('Get tag by slug', () => {
    test('return 404 if tag not found', async () => {
      const { status } = await elysia.tags({ slug: 'non-existent-tag-123' }).get();

      expect(status).toBe(404);
    });

    test('return 200 and the tag', async () => {
      const { data, status } = await elysia.tags({ slug: tagContext.tag.slug }).get();

      expect(status).toBe(200);
      expect(data?.slug).toBe(tagContext.tag.slug);
      expect(data?.name).toBe(tagContext.tag.name);
    });
  });
});
