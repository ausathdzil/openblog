export function generateSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function slugify(
  input: string | null | undefined,
  authorId: string | null | undefined,
  getExistingSlugs: (base: string, authorId: string) => Promise<string[]>
) {
  if (!(input && authorId)) {
    return null;
  }

  const base = generateSlug(input);
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
    suffix += 1;
  }

  return `${base}-${suffix}`;
}
