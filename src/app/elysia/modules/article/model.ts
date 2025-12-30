import { t } from 'elysia';

import { db } from '@/db/models';
import { AuthorModel } from '../author/model';

export namespace ArticleModel {
  const { articles } = db.select;
  const { createArticle } = db.insert;
  const { updateArticle } = db.update;

  export const createArticleBody = t.Object({
    title: createArticle.title,
    content: createArticle.content,
    status: createArticle.status,
    coverImage: createArticle.coverImage,
  });

  export type CreateArticleBody = typeof createArticleBody.static;

  export const articlesQuery = t.Object({
    status: t.Optional(articles.status),
    q: t.Optional(t.String()),
    page: t.Optional(t.Number({ minimum: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  });

  export type ArticlesQuery = typeof articlesQuery.static;

  export const articleResponse = t.Object({
    publicId: articles.publicId,
    title: articles.title,
    slug: articles.slug,
    content: articles.content,
    excerpt: articles.excerpt,
    status: articles.status,
    coverImage: articles.coverImage,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
    author: t.Nullable(AuthorModel.authorResponse),
  });

  export type ArticleResponse = typeof articleResponse.static;

  export const paginationMetaResponse = t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
    hasNext: t.Boolean(),
    hasPrev: t.Boolean(),
  });

  export type PaginationMetaResponse = typeof paginationMetaResponse.static;

  export const articlesResposnse = t.Object({
    data: t.Array(articleResponse),
    pagination: paginationMetaResponse,
  });

  export type ArticlesResponse = typeof articlesResposnse.static;

  export const updateArticleBody = t.Object({
    title: updateArticle.title,
    slug: updateArticle.slug,
    content: updateArticle.content,
    excerpt: updateArticle.excerpt,
    status: updateArticle.status,
    coverImage: updateArticle.coverImage,
  });

  export type UpdateArticleBody = typeof updateArticleBody.static;

  export const articleInvalid = t.Object({ message: t.String() });

  export type ArticleInvalid = typeof articleInvalid.static;
}
