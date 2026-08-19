import { t, validationDetail } from 'elysia';

import { validation } from '@/app/elysia/modules/article/validation';
import { authorResponse } from '../author/model';
import { tagResponse } from '../tag/model';
import { tagArrayValidation } from '../tag/validation';

const { articles } = validation.select;
const { createArticle } = validation.insert;
const { updateArticle } = validation.update;

export const createArticleBody = t.Object({
  title: createArticle.title,
  contentJson: createArticle.contentJson,
  excerpt: createArticle.excerpt,
  status: createArticle.status,
  coverImage: createArticle.coverImage,
  tags: tagArrayValidation,
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
  contentJson: articles.contentJson,
  excerpt: articles.excerpt,
  status: articles.status,
  coverImage: articles.coverImage,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  author: t.Nullable(authorResponse),
  tags: t.Optional(t.Array(tagResponse)),
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
  tags: t.Optional(t.Array(tagResponse)),
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
  contentJson: updateArticle.contentJson,
  excerpt: updateArticle.excerpt,
  coverImage: updateArticle.coverImage,
  tags: tagArrayValidation,
});

export type UpdateArticleBody = typeof updateArticleBody.static;

export const articleInvalid = t.Object({ message: t.String() });

export const uploadCoverImageBody = t.Object({
  file: t.File({
    type: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: '3m',
    error: validationDetail(
      'Cover image must be a JPEG, PNG, or WebP image no larger than 3MB.'
    ),
  }),
});

export const uploadCoverImageResponse = t.Object({
  message: t.String(),
  url: t.String(),
});

export const uploadCoverImageInvalid = t.Object({ message: t.String() });

export type UploadCoverImageBody = typeof uploadCoverImageBody.static;
