import { t } from 'elysia';

import { validation } from '@/db/models';

const { user: authors } = validation.select;

export const authorResponse = t.Object({
  name: authors.name,
  image: authors.image,
  createdAt: authors.createdAt,
  username: authors.username,
  displayUsername: authors.displayUsername,
  bio: t.Optional(t.Nullable(t.String())),
  website: t.Optional(t.Nullable(t.String())),
  twitter: t.Optional(t.Nullable(t.String())),
  facebook: t.Optional(t.Nullable(t.String())),
});

export type AuthorResponse = typeof authorResponse.static;

export const authorsQuery = t.Object({
  q: t.Optional(t.String()),
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export type AuthorsQuery = typeof authorsQuery.static;

const paginationMetaResponse = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
  hasNext: t.Boolean(),
  hasPrev: t.Boolean(),
});

export const authorsResponse = t.Object({
  data: t.Array(authorResponse),
  pagination: paginationMetaResponse,
});

export type AuthorsResponse = typeof authorsResponse.static;

export const authorInvalid = t.Object({ message: t.String() });
