import { headers } from 'next/headers';

import { elysia } from '@/lib/eden';

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
