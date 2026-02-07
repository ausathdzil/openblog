import { count, desc, eq, ilike, or } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { user } from '@/db/schema';
import type { AuthorModel } from './model';

export async function getAuthors({
  q,
  page = 1,
  limit = 20,
}: AuthorModel.AuthorsQuery) {
  const offset = (page - 1) * limit;

  const whereConditions = q
    ? or(
        ilike(user.name, `%${q}%`),
        ilike(user.username, `%${q}%`),
        ilike(user.displayUsername, `%${q}%`)
      )
    : undefined;

  const dataQuery = db
    .select({
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      username: user.username,
      displayUsername: user.displayUsername,
    })
    .from(user)
    .where(whereConditions)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({ count: count() })
    .from(user)
    .where(whereConditions);

  const [data, totalResult] = await Promise.all([dataQuery, countQuery]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  } satisfies AuthorModel.AuthorsResponse;
}

export async function getAuthorByUsername(username: string) {
  const [author] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      username: user.username,
      displayUsername: user.displayUsername,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!author) {
    throw new NotFoundError('Author not found.');
  }

  return author satisfies AuthorModel.AuthorResponse;
}

export async function getAuthorById(id: string) {
  const [author] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      username: user.username,
      displayUsername: user.displayUsername,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!author) {
    throw new NotFoundError('Author not found.');
  }

  return author satisfies AuthorModel.AuthorResponse;
}
