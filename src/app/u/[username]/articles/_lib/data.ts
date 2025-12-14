import { headers } from 'next/headers';

import { elysia } from '@/lib/eden';

export async function getArticle(slug: string) {
  const { data: article, error } = await elysia
    .articles({ publicId: slug })
    .get({
      headers: await headers(),
      fetch: {
        cache: 'force-cache',
        next: {
          tags: [`article-${slug}`],
        },
      },
    });

  return { article, error };
}
