# Plan 005: Remove redundant author queries in read endpoints

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Category**: perf

## Why this matters
Several functions in `src/app/elysia/modules/article/service.ts` issue two sequential database queries where one would suffice, or make redundant queries for data already available in the scope:
1. `getArticles` fetches the author first just to pass the `id` to the article query, when a deferred check or a join could optimize the happy path.
2. `getArticleBySlug` fetches the author first, then fetches the article. This can be combined into a single `innerJoin` on the user table.
3. `updateArticle` fetches the author using `getAuthorById`, but `getArticleByPublicId` already returns the `authorId`.

## Scope
- `src/app/elysia/modules/article/service.ts`

## Steps

### Step 1: Defer author query in `getArticles`
In `getArticles`, change the author fetching logic to only run if articles aren't found, preventing a redundant query when articles exist.

Change lines 65-72 to:
```typescript
  const offset = (page - 1) * limit;

  const whereConditions = and(
    eq(article.status, status ?? 'published'),
    username ? eq(user.username, username) : undefined,
    q ? ilike(article.title, `%${q}%`) : undefined
  );
```

Then, right after `const [data, totalResult] = await Promise.all([dataQuery, countQuery]);`, add:
```typescript
  if (data.length === 0 && username) {
    await getAuthorByUsername(username); // throws NotFoundError if not found
  }
```

### Step 2: Use `innerJoin` in `getArticleBySlug`
Remove `const author = await getAuthorByUsername(username);`.
Add the `author: { name: user.name, ... }` fields to the `.select()`.
Change `.where(...)` to include `eq(user.username, username)`.
Change `.from(article)` to `.from(article).innerJoin(user, eq(article.authorId, user.id))`.
Finally, return just `articleData` (since it will now have `author` inside it).

### Step 3: Remove `getAuthorById` in `updateArticle`
Remove `const author = await getAuthorById(articleData.authorId);`.
Instead of `author.id` in the `slugify` call, use `articleData.authorId`.
In the return statement, return `author: articleData.author!` (or however the type is satisfied, as `getArticleByPublicId` already returns the nested author).

**Verify**: `bun typecheck` && `bun test`

## Done criteria
- [ ] `bun typecheck` and `bun test` pass
- [ ] Redundant queries removed
