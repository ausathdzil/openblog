import { eq } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { user } from '@/db/schema';
import type { AuthorModel } from './model';

export async function getAuthors() {
  return (await db
    .select({
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      username: user.username,
      displayUsername: user.displayUsername,
    })
    .from(user)) satisfies Array<AuthorModel.AuthorResponse>;
}

export async function getAuthor(username: string) {
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
    throw new NotFoundError('Author not found');
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
    throw new NotFoundError('Author not found');
  }

  return author satisfies AuthorModel.AuthorResponse;
}
