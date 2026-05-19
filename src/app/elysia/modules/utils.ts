import * as z from 'zod';

const Slug = z.string().slugify();

export async function slugify(
  input: string | null | undefined,
  authorId: string | null | undefined,
  slugExists: (slug: string, authorId: string) => Promise<boolean>
) {
  if (!(input && authorId)) {
    return null;
  }

  const base = Slug.parse(input);
  let slug = base;
  let suffix = 2;

  while (await slugExists(slug, authorId)) {
    slug = `${base}-${suffix}`;
    suffix++;
  }

  return slug;
}
