import { afterEach, beforeEach } from 'node:test';
import { eq } from 'drizzle-orm';

import { slugify } from '@/app/elysia/modules/utils';
import { db } from '@/db';
import { article } from '@/db/schema';

export async function createTestArticle(userId: string) {
  const title = 'Test article';
  const content = 'Test content';
  const status = 'published';
  const coverImage = 'https://example.com';

  const [articleData] = await db
    .insert(article)
    .values({
      title,
      slug: await slugify(title, userId),
      content,
      excerpt: content,
      status,
      coverImage,
      authorId: userId,
    })
    .returning();

  return articleData;
}

export async function cleanupTestArticle(publicId: string) {
  await db.delete(article).where(eq(article.publicId, publicId));
}

type Article = typeof article.$inferSelect;

export function setupTestArticle(getUserId: () => string) {
  let articleData: Article;

  beforeEach(async () => {
    articleData = await createTestArticle(getUserId());
  });

  afterEach(async () => {
    await cleanupTestArticle(articleData.publicId);
  });

  return {
    get article() {
      return articleData;
    },
  };
}
