# Plan 004: Fix N+1 database queries on slug generation

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Category**: perf

## Why this matters
Currently, `slugify` repeatedly hits the database inside a `while` loop to check if a slug suffix exists (`slug-2`, `slug-3`, etc.). If a user has 10 articles with similar titles, it fires 10 sequential database queries. This should be a single query using a SQL `LIKE` operator to fetch all matching slugs at once.

## Commands you will need
| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun typecheck`          | exit 0, no errors   |
| Tests     | `bun test`               | all pass            |

## Scope
- `src/app/elysia/modules/utils.ts`
- `src/db/utils.ts`
- `src/app/elysia/modules/article/service.ts`

## Steps

### Step 1: Replace `slugExists` with `getExistingSlugs` in db utils
In `src/db/utils.ts`, import `like` from `drizzle-orm` (alongside `and` and `eq`). Then replace the `slugExists` function with:
```typescript
export async function getExistingSlugs(base: string, authorId: string) {
  const existing = await db
    .select({ slug: article.slug })
    .from(article)
    .where(
      and(
        like(article.slug, `${base}%`),
        eq(article.authorId, authorId)
      )
    );

  return existing.map((e) => e.slug);
}
```

### Step 2: Update `slugify` to use `getExistingSlugs`
In `src/app/elysia/modules/utils.ts`, update `slugify` to accept `getExistingSlugs` instead of `slugExists`:
```typescript
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
```

### Step 3: Update `service.ts` imports and usages
In `src/app/elysia/modules/article/service.ts`, change the import from `slugExists` to `getExistingSlugs`. 
Update all calls to `slugify` in `createArticle` and `updateArticle` to pass `getExistingSlugs`.

**Verify**: `bun typecheck` && `bun test`

## Done criteria
- [ ] `bun typecheck` and `bun test` pass
- [ ] N+1 while loop database queries removed
