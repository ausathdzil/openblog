import { beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { tag } from '@/db/schema';
import { elysia } from '@/lib/eden';

describe('Elysia Tags API', () => {
  beforeAll(async () => {
    // Clear tags first or ensure clean state if needed
    // We will insert a test tag
    const [existing] = await db
      .select()
      .from(tag)
      .where(eq(tag.slug, 'test-tag-api'));
    if (!existing) {
      await db
        .insert(tag)
        .values({ name: 'Test Tag API', slug: 'test-tag-api' });
    }
  });

  it('fetches all tags', async () => {
    const { data, status } = await elysia.tag.get();

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBeGreaterThan(0);

    const testTag = data?.find((t: any) => t.slug === 'test-tag-api');
    expect(testTag).toBeDefined();
    expect(testTag?.name).toBe('Test Tag API');
  });

  it('fetches a single tag by slug', async () => {
    const { data, status } = await elysia.tag({ slug: 'test-tag-api' }).get();

    expect(status).toBe(200);
    expect(data?.slug).toBe('test-tag-api');
    expect(data?.name).toBe('Test Tag API');
  });

  it('returns 404 for unknown tag', async () => {
    const { status } = await elysia.tag({ slug: 'non-existent-tag-123' }).get();

    expect(status).toBe(404);
  });
});
