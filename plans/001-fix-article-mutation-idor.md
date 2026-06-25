# Plan 001: Fix IDOR vulnerability allowing any user to update or delete published articles

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat f553ecb..HEAD -- src/app/elysia/modules/article/service.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `f553ecb`, 2026-06-25

## Why this matters

Currently, `getArticleByPublicId` bypasses ownership checks if an article is published. The `updateArticle` and `deleteArticle` mutations rely on `getArticleByPublicId` to fetch the article but never explicitly verify that the requesting `userId` matches the `articleData.authorId`. This creates an Insecure Direct Object Reference (IDOR) where any authenticated user can edit or permanently delete any published article authored by anyone else, risking severe data tampering and loss.

## Current state

- `src/app/elysia/modules/article/service.ts` — handles article database operations and authorization logic.

Current `updateArticle` excerpt (lines 198-216):
```typescript
export async function updateArticle(
  publicId: string,
  {
    title,
    content,
    excerpt,
    status: articleStatus,
    coverImage,
  }: UpdateArticleBody,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const articleData = await getArticleByPublicId(publicId, userId);
  const author = await getAuthorById(articleData.authorId);
```

Current `deleteArticle` excerpt (lines 269-279):
```typescript
export async function deleteArticle(
  publicId: string,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const articleData = await getArticleByPublicId(publicId, userId);

  await db.delete(article).where(eq(article.publicId, articleData.publicId));
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun typecheck`          | exit 0, no errors   |
| Lint      | `bun check`              | exit 0              |
| Tests     | `bun test`               | all pass            |

## Scope

**In scope** (the only files you should modify):
- `src/app/elysia/modules/article/service.ts`

**Out of scope** (do NOT touch, even though they look related):
- `getArticleByPublicId` implementation (this is intentionally permissive for reads).
- Any other service files.

## Git workflow

- Branch: `advisor/001-fix-article-mutation-idor`
- Commit per step or per logical unit; message style: `fix(article): add ownership validation to mutations to prevent IDOR`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add ownership check to updateArticle

In `src/app/elysia/modules/article/service.ts`, immediately after fetching `articleData` in `updateArticle`, add an explicit validation check to ensure `articleData.authorId === userId`. Throw an `AuthError` if it fails.

```typescript
  const articleData = await getArticleByPublicId(publicId, userId);
  
  if (articleData.authorId !== userId) {
    throw new AuthError('You are not allowed to perform this action.', 403);
  }

  const author = await getAuthorById(articleData.authorId);
```

**Verify**: `bun typecheck` → exit 0, no errors

### Step 2: Add ownership check to deleteArticle

In the same file, immediately after fetching `articleData` in `deleteArticle`, add the exact same explicit validation check.

```typescript
  const articleData = await getArticleByPublicId(publicId, userId);

  if (articleData.authorId !== userId) {
    throw new AuthError('You are not allowed to perform this action.', 403);
  }

  await db.delete(article).where(eq(article.publicId, articleData.publicId));
```

**Verify**: `bun typecheck` → exit 0, no errors
**Verify**: `bun test` → all pass

## Test plan

- Test coverage for this IDOR vector is handled by plan `002-test-article-mutation-authorization.md`. For this plan, just ensure the existing test suite passes (`bun test`).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun typecheck` exits 0
- [ ] `bun test` exits 0
- [ ] The ownership check `if (articleData.authorId !== userId)` is present in both `updateArticle` and `deleteArticle`.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts (the codebase has drifted since this plan was written).
- The existing tests fail after your modifications.
- The fix appears to require touching an out-of-scope file.

## Maintenance notes

- Future mutation functions added to this service must also explicitly verify ownership. `getArticleByPublicId` should be considered an unsafe read in the context of mutations for published articles.
