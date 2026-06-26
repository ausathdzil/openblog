---
commit: d9dacc1
---

# 010: Freeze Slugs of Published Articles

## Goal
Stop updating an article's `slug` when its title is changed if the article is not a draft. This prevents SEO breakage and dead inbound links caused by URLs changing after publication.

## Context
When an article title is updated via the `updateArticle` service function, its slug is automatically regenerated from the new title. If the article is already published, changing the slug breaks existing links and SEO rankings. We want to restrict automatic slug updates exclusively to articles that are still in `draft` status.

## Target File
`src/app/elysia/modules/article/service.ts`

## Current Code Example
Around line 228:
```typescript
  if (title !== undefined && title !== articleData.title) {
    payload.title = title?.trim();
    payload.slug = await slugify(title, articleData.authorId, getExistingSlugs);
  }
```

## Steps
1. Modify the `if` condition block for `title` in `updateArticle` to only regenerate the slug if `articleData.status === 'draft'`.
2. The logic should look exactly like this:
```typescript
  if (title !== undefined && title !== articleData.title) {
    payload.title = title?.trim();
    if (articleData.status === 'draft') {
      payload.slug = await slugify(title, articleData.authorId, getExistingSlugs);
    }
  }
```
3. Run verification commands to ensure no syntax errors and types are valid.

## Done Criteria
- `bun run typecheck` completes with no errors.
- `bun run check` completes with no errors.
- `bun test` passes successfully.

## Maintenance Notes
If manual slug editing is added in the future, it should explicitly allow the user to override this behavior, but for automatic generation derived from the title, this freeze must remain to protect published URLs.
