import { eq, inArray } from 'drizzle-orm';
import { InternalServerError, NotFoundError } from 'elysia';

import { db } from '@/db';
import { articleTag, tag } from '@/db/schema';
import { generateSlug } from '../utils';

export async function getTags() {
  const allTags = await db.select().from(tag);
  return allTags;
}

export async function getTagBySlug(slug: string) {
  const [tagData] = await db
    .select()
    .from(tag)
    .where(eq(tag.slug, slug))
    .limit(1);

  if (!tagData) {
    throw new NotFoundError('Tag not found.');
  }

  return tagData;
}

export async function syncArticleTags(articleId: number, tags: string[]) {
  await db.delete(articleTag).where(eq(articleTag.articleId, articleId));
  for (const tagName of tags) {
    const tagSlug = generateSlug(tagName);
    let [existingTag] = await db
      .select()
      .from(tag)
      .where(eq(tag.name, tagName));
    if (!existingTag) {
      const [newTag] = await db
        .insert(tag)
        .values({ name: tagName, slug: tagSlug })
        .returning();
      if (!newTag) {
        throw new InternalServerError('Failed to create tag.');
      }
      existingTag = newTag;
    }
    await db.insert(articleTag).values({ articleId, tagId: existingTag.id });
  }
}

export async function getTagsForArticle(articleId: number) {
  const allTags = await db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })
    .from(articleTag)
    .innerJoin(tag, eq(tag.id, articleTag.tagId))
    .where(eq(articleTag.articleId, articleId));

  return allTags;
}

export async function getTagsForArticles(articleIds: number[]) {
  if (articleIds.length === 0) {
    return [];
  }

  const allTags = await db
    .select({
      articleId: articleTag.articleId,
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })
    .from(articleTag)
    .innerJoin(tag, eq(tag.id, articleTag.tagId))
    .where(inArray(articleTag.articleId, articleIds));

  return allTags;
}
