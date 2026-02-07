import { cacheLife, cacheTag } from 'next/cache';
import { elysia } from '@/lib/eden';

export async function getAuthor(username: string) {
  const { data: author, error: authorError } = await elysia
    .authors({ username })
    .get();

  return { author, authorError };
}

export async function getUserArticles(
  username: string,
  q?: string,
  page?: number,
  limit?: number
) {
  const { data: articles, error: articlesError } = await elysia
    .authors({ username })
    .articles.get({
      query: { q, page, limit },
    });

  return { articles, articlesError };
}

export async function getArtcileByPublicId(
  headersRecord: Record<string, string>,
  publicId: string
) {
  'use cache';

  cacheTag(`article-${publicId}`);
  cacheLife('seconds');

  const { data: article, error } = await elysia.articles({ publicId }).get({
    headers: headersRecord,
  });

  return { article, error };
}

export async function getUserArticleBySlug(slug: string, username: string) {
  const { data: article, error } = await elysia
    .authors({ username })
    .articles({ slug })
    .get();

  return { article, error };
}
