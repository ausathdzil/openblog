import { and, eq } from 'drizzle-orm';
import * as z from 'zod';

import { db } from '@/db';
import { article } from '@/db/schema';

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
      .select({ id: article.id })
      .from(article)
      .where(and(eq(article.slug, slug), eq(article.authorId, authorId)))
      .limit(1);

    if (!existing) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix++;
  }
}
