import { elysia } from '@/lib/eden';

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
  status?: 'draft' | 'published' | 'archived' | null | undefined,
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
