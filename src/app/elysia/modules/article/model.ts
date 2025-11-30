import { t } from 'elysia';

import { db } from '@/db/models';

export namespace ArticleModel {
  const { articles } = db.insert;

  export const createArticleBody = t.Object({
    title: articles.title,
    content: articles.content,
    status: articles.status,
    coverImage: articles.coverImage,
    authorId: articles.authorId,
  });

  export type CreateArticleBody = typeof createArticleBody.static;

  export const createArticleResponse = t.Object({
    publicId: articles.publicId,
    title: articles.title,
    slug: articles.slug,
    content: articles.content,
    excerpt: articles.excerpt,
    status: articles.status,
    coverImage: articles.coverImage,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
  });

  export type CreateArticleResponse = typeof createArticleResponse.static;

  export const getArticlesResponse = t.Array(
    t.Object({
      publicId: articles.publicId,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      excerpt: articles.excerpt,
      status: articles.status,
      coverImage: articles.coverImage,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
    }),
  );

  export type GetArticlesResponse = typeof getArticlesResponse.static;
}
