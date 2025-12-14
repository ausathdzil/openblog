import { headers } from 'next/headers';

import { elysia } from '@/lib/eden';

export async function getArticles(q?: string) {
  const { data: articles } = await elysia.articles.get({
    query: { q },
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

export async function getArtcileByPublicId(publicId: string) {
  const { data: article, error } = await elysia.articles({ publicId }).get({
    headers: await headers(),
    fetch: {
      cache: 'force-cache',
      next: {
        tags: [`article-${publicId}`],
      },
    },
  });

  return { article, error };
}
