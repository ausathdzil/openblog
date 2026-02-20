import { and, eq } from 'drizzle-orm';
import * as z from 'zod';

import { db } from '@/db';
import { articles } from '@/db/schema';

const Slug = z.string().slugify();

export async function slugify(
  input: string | null | undefined,
  authorId: string | null | undefined
) {
  if (!(input && authorId)) {
    return null;
  }

  const base = Slug.parse(input);
  let slug = base;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.authorId, authorId)))
      .limit(1);

    if (!existing) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix++;
  }
}
