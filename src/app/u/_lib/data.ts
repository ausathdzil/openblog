import { elysia } from '@/lib/eden';

export async function getAuthor(username: string) {
  const { data: author, error: authorError } = await elysia
    .authors({ username })
    .get({
      fetch: {
        cache: 'force-cache',
        next: {
          revalidate: 900,
          tags: [`author-${username}`],
        },
      },
    });

  return { author, authorError };
}

export async function getArticles(
  username: string,
  q?: string,
  page?: number,
  limit?: number,
) {
  const { data: articles, error: articlesError } = await elysia
    .authors({ username })
    .articles.get({
      query: { q, page, limit },
      fetch: {
        cache: 'force-cache',
        next: {
          revalidate: 900,
          tags: [`articles-${username}`],
        },
      },
    });

  return { articles, articlesError };
}

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
