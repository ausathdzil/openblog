import { eq } from 'drizzle-orm';

import { slugify } from '@/app/elysia/modules/utils';
import { db } from '@/db';
import { articles, user } from '@/db/schema';
import { auth } from '@/lib/auth';

function generateUniqueId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}

export async function createTestUser() {
  const uniqueId = generateUniqueId();

  const userData = {
    name: 'Test User',
    username: `test_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: 'Test_Password_123!',
  };

  const res = await auth.api.signUpEmail({
    body: userData,
    asResponse: true,
  });

  return {
    data: userData,
    headers: {
      cookie: res.headers.getSetCookie().join('; '),
    },
  };
}

export async function createTestArticle(headers: HeadersInit) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new Error('Session not found');
  }

  const title = 'Test article';
  const content = 'Test content';
  const status = 'published';
  const coverImage = 'https://example.com';

  const [article] = await db
    .insert(articles)
    .values({
      title,
      slug: await slugify(title, session.user.username),
      content,
      excerpt: content,
      status,
      coverImage,
      authorId: session.user.id,
    })
    .returning();

  return article;
}

export async function cleanupTestUser(username: string) {
  await db.delete(user).where(eq(user.username, username));
}

export async function cleanupTestArticle(publicId: string) {
  await db.delete(articles).where(eq(articles.publicId, publicId));
}
