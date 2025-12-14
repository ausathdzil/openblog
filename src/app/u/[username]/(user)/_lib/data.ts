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

export async function getArticles(username?: string, q?: string) {
  const { data: articles, error: articlesError } = await elysia.articles.get({
    query: { username, q },
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
