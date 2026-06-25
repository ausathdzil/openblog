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

export async function getArticleByPublicId(
  headersRecord: Record<string, string>,
  publicId: string
) {
  const { data: article, error } = await elysia.articles({ publicId }).get({
    headers: headersRecord,
  });

  return { article, error };
}

export async function getUserArticleBySlug(slug: string, username: string) {
  'use cache';

  cacheTag(`article-${slug}`);
  cacheLife('max');

  const { data: article, error } = await elysia
    .authors({ username })
    .articles({ slug })
    .get();

  return { article, error };
}

export async function getArticles(q?: string, page?: number, limit?: number) {
  const { data: articles } = await elysia.articles.get({
    query: { q, page, limit },
  });

  return { articles };
}

export async function getAuthors(q?: string, page?: number, limit = 9) {
  const { data: authors } = await elysia.authors.get({
    query: { q, page, limit },
  });

  return { authors };
}

export async function getCurrentUserArticles(
  headersRecord: Record<string, string>,
  status?: 'draft' | 'published' | 'archived' | undefined,
  q?: string | undefined,
  page?: number,
  limit?: number
) {
  const { data: articles, error } = await elysia.me.articles.get({
    headers: headersRecord,
    query: { status, q, page, limit },
    fetch: {
      cache: 'force-cache',
      next: {
        revalidate: 900,
        tags: ['articles'],
      },
    },
  });

  return { articles, error };
}
