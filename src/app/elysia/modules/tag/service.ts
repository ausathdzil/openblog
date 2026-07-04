import { eq, ilike, inArray } from 'drizzle-orm';
import { InternalServerError, NotFoundError } from 'elysia';

import { db } from '@/db';
import { articleTag, tag } from '@/db/schema';
import { generateSlug } from '../utils';
import type { TagResponse, TagsResponse } from './model';

export async function getTags(query?: { q?: string }) {
  if (query?.q) {
    return (await db
      .select({ name: tag.name, slug: tag.slug })
      .from(tag)
      .where(ilike(tag.name, `%${query.q}%`))
      .limit(20)) satisfies TagsResponse;
  }
  const allTags = await db
    .select({ name: tag.name, slug: tag.slug })
    .from(tag)
    .limit(20);
  return allTags satisfies TagsResponse;
}

export async function getTagBySlug(slug: string) {
  const [tagData] = await db
    .select({ name: tag.name, slug: tag.slug })
    .from(tag)
    .where(eq(tag.slug, slug))
    .limit(1);

  if (!tagData) {
    throw new NotFoundError('Tag not found.');
  }

  return tagData satisfies TagResponse;
}

export async function syncArticleTags(articleId: number, tags: string[]) {
  await db.delete(articleTag).where(eq(articleTag.articleId, articleId));

  // Deduplicate and normalize tags
  const normalizedTags = Array.from(
    new Set(tags.map((t) => t.trim().toLowerCase()))
  ).filter(Boolean);

  for (const tagName of normalizedTags) {
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
      name: tag.name,
      slug: tag.slug,
    })
    .from(articleTag)
    .innerJoin(tag, eq(tag.id, articleTag.tagId))
    .where(inArray(articleTag.articleId, articleIds));

  return allTags;
}
