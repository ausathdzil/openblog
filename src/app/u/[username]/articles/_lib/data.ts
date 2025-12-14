import { elysia } from '@/lib/eden';

export async function getArticleBySlug(slug: string, username: string) {
  const { data: article, error } = await elysia
    .authors({ username })
    .articles({ slug })
    .get({
      fetch: {
        cache: 'force-cache',
        next: {
          tags: [`article-${slug}`],
        },
      },
    });

  return { article, error };
}
