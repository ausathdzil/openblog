import type { TestHelpers } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

import { slugify } from '@/app/elysia/modules/utils';
import { db } from '@/db';
import { article, user } from '@/db/schema';
import { auth } from './auth';

let testHelpersPromise: Promise<TestHelpers> | null = null;

function getTestHelpers(): Promise<TestHelpers> {
  if (!testHelpersPromise) {
    testHelpersPromise = auth.$context.then((ctx) => ctx.test);
  }
  return testHelpersPromise;
}

function generateUniqueId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}

/**
 * Narrow `saveUser` result for stable field access (username plugin fields are not inferred on `TestHelpers` yet).
 * Revisit after a Better Auth release improves `ctx.test` typing.
 */
interface TestSavedUserShape {
  email: string;
  id: string;
  name: string;
  username: string | null;
}

export async function createTestUser() {
  const uniqueId = generateUniqueId();
  const test = await getTestHelpers();

  const draft = test.createUser({
    name: 'Test User',
    username: `test_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
  });

  const user = (await test.saveUser(draft)) as unknown as TestSavedUserShape;
  const headers = await test.getAuthHeaders({ userId: user.id });

  const userData = {
    name: user.name,
    username: user.username ?? `test_${uniqueId}`,
    email: user.email,
    password: 'Test_Password_123!',
  };

  return {
    data: userData,
    userId: user.id,
    headers,
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

  const [articleData] = await db
    .insert(article)
    .values({
      title,
      slug: await slugify(title, session.user.id),
      content,
      excerpt: content,
      status,
      coverImage,
      authorId: session.user.id,
    })
    .returning();

  return articleData;
}

export async function cleanupTestUser(userId: string) {
  const test = await getTestHelpers();
  await test.deleteUser(userId);
  await db.delete(user).where(eq(user.id, userId));
}

export async function cleanupTestArticle(publicId: string) {
  await db.delete(article).where(eq(article.publicId, publicId));
}
