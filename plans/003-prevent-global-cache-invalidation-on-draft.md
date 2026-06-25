# Plan 003: Prevent global cache invalidation on draft autosaves

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat f553ecb..HEAD -- src/lib/article-actions.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `f553ecb`, 2026-06-25

## Why this matters

The editor client automatically triggers the `updateArticle` server action on a 1000ms debounce while a user edits a draft. The `updateArticle` action currently issues a global `updateTag('articles')` unconditionally on any successful update. This means any active editor typing a draft will bust the global cache for the public feed every second, destroying Next.js caching efficiency and hammering the database unnecessarily under load. Global feed caches should only be invalidated when published articles change.

## Current state

- `src/lib/article-actions.ts` — Contains the Next.js Server Actions for article state management, including `updateArticle`.

Current `updateArticle` cache invalidation excerpt (lines 126-131):
```typescript
  if (data) {
    updateTag('articles');
    updateTag(`articles-${data.author?.username}`);
    updateTag(`article-${data.slug}`);
  }
}
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun typecheck`          | exit 0, no errors   |
| Lint      | `bun check`              | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/lib/article-actions.ts`

**Out of scope** (do NOT touch, even though they look related):
- The `debounce` logic in the client component (`src/app/(article)/_components/article-editor.tsx`).
- Other actions like `archiveArticle` or `deleteArticle` (they are intentional manual user actions).

## Git workflow

- Branch: `advisor/003-prevent-global-cache-invalidation-on-draft`
- Commit per step or per logical unit; message style: `perf(article): prevent global cache busting on draft autosaves`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Conditionally invalidate the global articles cache

In `src/lib/article-actions.ts`, modify the cache invalidation block at the end of `updateArticle` so that `updateTag('articles')` is only called if the article is actively published. We can check this via `data.status === 'published'`.

Modify lines 126-131 to:
```typescript
  if (data) {
    if (data.status === 'published') {
      updateTag('articles');
    }
    updateTag(`articles-${data.author?.username}`);
    updateTag(`article-${data.slug}`);
  }
```

*Note: `updateTag('articles-${data.author?.username}')` and `updateTag('article-${data.slug}')` remain unconditional so that the author's personal dashboard and the article preview correctly reflect the latest draft edits.*

**Verify**: `bun typecheck` → exit 0, no errors
**Verify**: `bun check` → exit 0

## Test plan

- No automated tests currently exist for Next.js cache tags in this repository. Verify correctness via manual testing: edit a draft in the browser and confirm via Vercel / Next.js debug logs that a revalidation of the global `/` path or `articles` tag does not occur.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun typecheck` exits 0
- [ ] `updateTag('articles')` is guarded by an `if (data.status === 'published')` condition in `updateArticle`.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `data.status` is undefined or inaccessible in the server action response shape.
- The `updateArticle` cache block looks drastically different from the "Current state" excerpt.

## Maintenance notes

- If "draft" or "archived" states ever leak onto public global pages, this change means they wouldn't auto-update. However, since the homepage only pulls `published` articles, tying global cache busting strictly to the `published` status correctly bridges data state and cache state.
