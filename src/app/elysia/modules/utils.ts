import * as z from 'zod';

const Slug = z.string().slugify();

export async function slugify(
  input: string | null | undefined,
  authorId: string | null | undefined,
  getExistingSlugs: (base: string, authorId: string) => Promise<string[]>
) {
  if (!(input && authorId)) {
    return null;
  }

  const base = Slug.parse(input);
  const existingSlugs = await getExistingSlugs(base, authorId);
  
  if (existingSlugs.length === 0) {
    return base;
  }
  
  const existingSet = new Set(existingSlugs);
  if (!existingSet.has(base)) {
    return base;
  }

  let suffix = 2;
  while (existingSet.has(`${base}-${suffix}`)) {
    suffix++;
  }

  return `${base}-${suffix}`;
}
