import { t } from 'elysia';

import { validation } from '@/db/models';
import { authorResponse } from '../author/model';

const { articles } = validation.select;
const { createArticle } = validation.insert;
const { updateArticle } = validation.update;

export const createArticleBody = t.Object({
  title: createArticle.title,
  content: createArticle.content,
  contentJson: t.Optional(t.Any()),
  excerpt: createArticle.excerpt,
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
  contentJson: articles.contentJson,
  excerpt: articles.excerpt,
  status: articles.status,
  coverImage: articles.coverImage,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  author: t.Nullable(authorResponse),
});

export type ArticleResponse = typeof articleResponse.static;

const articleListResponse = t.Object({
  publicId: articles.publicId,
  title: articles.title,
  slug: articles.slug,
  excerpt: articles.excerpt,
  status: articles.status,
  coverImage: articles.coverImage,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  author: t.Nullable(authorResponse),
});

export type ArticleListResponse = typeof articleListResponse.static;

const paginationMetaResponse = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
  hasNext: t.Boolean(),
  hasPrev: t.Boolean(),
});

export const articlesResposnse = t.Object({
  data: t.Array(articleListResponse),
  pagination: paginationMetaResponse,
});

export type ArticlesResponse = typeof articlesResposnse.static;

export const updateArticleBody = t.Object({
  status: updateArticle.status,
  title: updateArticle.title,
  slug: updateArticle.slug,
  content: updateArticle.content,
  contentJson: t.Optional(t.Any()),
  excerpt: updateArticle.excerpt,
  coverImage: updateArticle.coverImage,
});

export type UpdateArticleBody = typeof updateArticleBody.static;

export const articleInvalid = t.Object({ message: t.String() });
