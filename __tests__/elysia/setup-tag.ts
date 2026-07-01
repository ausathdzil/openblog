import { afterAll, beforeAll } from 'bun:test';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { tag } from '@/db/schema';

export async function createTestTag(name: string, slug: string) {
  const [tagData] = await db
    .insert(tag)
    .values({
      name,
      slug,
    })
    .returning();

  if (!tagData) {
    throw new Error('Failed to create test tag');
  }

  return tagData;
}

export async function cleanupTestTag(id: string) {
  await db.delete(tag).where(eq(tag.id, id));
}

export function setupTestTag(name: string, slug: string) {
  let tagData: typeof tag.$inferSelect | null = null;

  const requireTag = () => {
    if (!tagData) {
      throw new Error('Failed to setup test tag');
    }
    return { tagData };
  };

  beforeAll(async () => {
    const [existing] = await db.select().from(tag).where(eq(tag.slug, slug));
    if (existing) {
      tagData = existing;
    } else {
      tagData = await createTestTag(name, slug);
    }
  });

  afterAll(async () => {
    if (tagData) {
      await cleanupTestTag(tagData.id);
      tagData = null;
    }
  });

  return {
    get tag() {
      return requireTag().tagData;
    },
  };
}
