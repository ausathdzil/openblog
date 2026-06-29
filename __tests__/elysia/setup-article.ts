import { afterEach, beforeEach } from 'bun:test';
import { eq } from 'drizzle-orm';

import { slugify } from '@/app/elysia/modules/utils';
import { db } from '@/db';
import { article } from '@/db/schema';
import { getExistingSlugs } from '@/db/utils';

export async function createTestArticle(userId: string) {
  const title = 'Test article';
  const content = 'Test content';
  const status = 'published';
  const coverImage = 'https://example.com';

  const [articleData] = await db
    .insert(article)
    .values({
      title,
      slug: await slugify(title, userId, getExistingSlugs),
      excerpt: content,
      status,
      coverImage,
      authorId: userId,
    })
    .returning();

  if (!articleData) {
    throw new Error('Failed to create test article');
  }

  return articleData;
}

export async function cleanupTestArticle(publicId: string) {
  await db.delete(article).where(eq(article.publicId, publicId));
}

export function setupTestArticle(getUserId: () => string) {
  let articleData: typeof article.$inferSelect | null = null;

  const requireArticle = () => {
    if (!articleData) {
      throw new Error('Failed to setup test article');
    }
    return { articleData };
  };

  beforeEach(async () => {
    articleData = await createTestArticle(getUserId());
  });

  afterEach(async () => {
    if (articleData) {
      await cleanupTestArticle(articleData.publicId);
      articleData = null;
    }
  });

  return {
    get article() {
      return requireArticle().articleData;
    },
  };
}
