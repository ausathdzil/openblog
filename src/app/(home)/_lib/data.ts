import { headers } from 'next/headers';

import { elysia } from '@/lib/eden';

export async function getArticles(q?: string, page?: number, limit?: number) {
  const { data: articles } = await elysia.articles.get({
    query: { q, page, limit },
    fetch: {
      cache: 'force-cache',
      next: {
        revalidate: 900,
        tags: ['articles'],
      },
    },
  });

  return { articles };
}

export async function getAuthors(q?: string, page?: number, limit?: number) {
  const { data: authors } = await elysia.authors.get({
    query: { q, page, limit },
    fetch: {
      cache: 'force-cache',
      next: {
        revalidate: 900,
        tags: ['authors'],
      },
    },
  });
  return { authors };
}

export async function getCurrentUserArticles(
  status?: 'draft' | 'published' | 'archived' | null | undefined,
  q?: string | undefined,
  page?: number,
  limit?: number,
) {
  const { data: articles, error } = await elysia.me.articles.get({
    headers: await headers(),
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
