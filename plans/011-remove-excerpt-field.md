# Plan 011: Remove excerpt field from article editor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0b648c1..HEAD -- src/app/\(article\)/_components/article-editor.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `0b648c1`, 2026-06-27

## Why this matters

The authoring experience should be streamlined. Currently, the excerpt field is always visible and required during drafting, which adds friction. We want to remove it from the main editor view and only ask for it later during the actual publishing flow (handled in a separate plan).

## Current state

- `src/app/(article)/_components/article-editor.tsx` — The main editor component. It defines `articleSchema` which includes `excerpt`, sets it in `defaultValues`, and renders a `ResizableTextarea` for it.

Excerpt of `src/app/(article)/_components/article-editor.tsx`:
```tsx
const articleSchema = z.object({
  title: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Title must be 255 characters or fewer.')
    ),
  content: z.string().check(z.trim()),
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
  status: z.literal(
    ['draft', 'published', 'archived'],
    'Status must be either draft, published, or archived.'
  ),
});
```
```tsx
          <form.Field
            name="excerpt"
            validators={{
              onChange: articleSchema.shape.excerpt,
            }}
          >
            {(field) => {
              // ... renders ResizableTextarea for excerpt
            }}
          </form.Field>
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Lint      | `bun run check`          | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/app/(article)/_components/article-editor.tsx`

**Out of scope** (do NOT touch, even though they look related):
- API endpoints or database schemas.

## Git workflow

- Branch: `advisor/011-remove-excerpt-field`
- Commit per step or per logical unit; message style: conventional commits (e.g., `refactor: remove excerpt field from editor UI`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove excerpt from article-editor UI and form

1. In `src/app/(article)/_components/article-editor.tsx`, remove the `excerpt` field from `articleSchema`.
2. Remove `excerpt` from the `defaultValues` of `useForm`.
3. In the `onSubmit` handler, remove `excerpt: value.excerpt` from the payload sent to `updateArticle`.
4. Remove the entire `<form.Field name="excerpt">` block from the JSX.

**Verify**: `bun run typecheck` → exit 0, no errors

## Test plan

- No new automated tests are required. Verify typecheck passes and UI compiles.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run check` exits 0
- [ ] The `excerpt` field is no longer present in `article-editor.tsx`.
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:
- `bun run typecheck` fails because `updateArticle` strongly requires an excerpt (if so, we must adjust the payload or API, stop and report).

## Maintenance notes

- The `excerpt` field will be reintroduced in the next plan (012) as part of a modal during the publishing step.
