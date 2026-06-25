# Plan 002: Add authorization tests for article mutations

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat f553ecb..HEAD -- __tests__/elysia/article.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 001-fix-article-mutation-idor.md
- **Category**: tests
- **Planned at**: commit `f553ecb`, 2026-06-25

## Why this matters

The test suite completely misses the case where an authenticated user attempts to mutate (update or delete) an asset they do not own. Because these tests were absent, an IDOR vulnerability shipped to production. Adding these tests guarantees that the access control gap closed in Plan 001 stays closed, providing a long-term verification baseline for authorization logic.

## Current state

- `__tests__/elysia/article.test.ts` — Contains integration tests for the Elysia article endpoints.

Current test setup excerpt (`__tests__/elysia/article.test.ts:4-7`):
```typescript
import { cleanupTestArticle, setupTestArticle } from './setup-article';
import { setupAuthContext } from './setup-auth';

const authContext = setupAuthContext();
```

Current `Update article` suite excerpt (`__tests__/elysia/article.test.ts:96-120`):
```typescript
  describe('Update article', () => {
    const ctx = setupTestArticle(() => authContext.testUser.id);

    test('return 404 if article does not exist', async () => {
// ...
    test('return 401 if not authenticated', async () => {
// ...
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun typecheck`          | exit 0, no errors   |
| Lint      | `bun check`              | exit 0              |
| Tests     | `bun test`               | all pass            |

## Scope

**In scope** (the only files you should modify):
- `__tests__/elysia/article.test.ts`

**Out of scope** (do NOT touch, even though they look related):
- `setup-auth.ts`, `setup-article.ts`, or any source code files.

## Git workflow

- Branch: `advisor/002-test-article-mutation-authorization` (if running separately)
- Commit per step or per logical unit; message style: `test(article): add IDOR verification tests for update and delete endpoints`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a secondary test user to the test suite

In `__tests__/elysia/article.test.ts`, right after `const authContext = setupAuthContext();`, create a secondary auth context to represent an attacker/unauthorized user:

```typescript
const secondaryAuthContext = setupAuthContext();
```

**Verify**: `bun typecheck` → exit 0, no errors

### Step 2: Write test for unauthorized update

Inside the `describe('Update article', ...)` block, add a new test case that asserts a user cannot update an article they do not own. We will use the `secondaryAuthContext` to get headers, but attempt to update the article belonging to `authContext.testUser.id`.

```typescript
    test('return 403 if user is not the author', async () => {
      const article = ctx.article;

      // Get headers for a DIFFERENT user
      const headers = await secondaryAuthContext.authTest.getAuthHeaders({
        userId: secondaryAuthContext.testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .patch({ title: 'Hacked Title' }, { headers });

      expect(status).toBe(403);
    });
```

**Verify**: `bun test` → the new test passes (assuming Plan 001 is already applied). If it fails with a 200, Plan 001 is missing!

### Step 3: Write test for unauthorized delete

Inside the `describe('Delete article', ...)` block, add a similar new test case asserting a 403 status code when the secondary user attempts deletion.

```typescript
    test('return 403 if user is not the author', async () => {
      const article = ctx.article;

      // Get headers for a DIFFERENT user
      const headers = await secondaryAuthContext.authTest.getAuthHeaders({
        userId: secondaryAuthContext.testUser.id,
      });

      const { status } = await elysia
        .articles({ publicId: article.publicId })
        .delete({}, { headers });

      expect(status).toBe(403);
    });
```

**Verify**: `bun test` → all tests pass.

## Test plan

- Verification is the action itself (`bun test`). All tests, including the newly added ones, must pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun typecheck` exits 0
- [ ] `bun test` exits 0, and the test count increases by 2.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The new tests fail (return 200 instead of 403). This means Plan 001 was not properly applied or the service logic is flawed. STOP and report the failure.
- `secondaryAuthContext` conflicts with the test database setup (e.g., uniqueness constraints on users in `setup-auth.ts`).

## Maintenance notes

- Whenever new data mutation endpoints are added, explicitly verify IDOR cases using this pattern of a primary and secondary authenticated user.
