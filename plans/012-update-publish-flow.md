# Plan 012: Update publish flow with confirmation dialog

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0b648c1..HEAD -- src/app/\(article\)/_components/publish-button.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 011
- **Category**: dx
- **Planned at**: commit `0b648c1`, 2026-06-27

## Why this matters

Publishing an article is a significant action. Currently, clicking "Publish" immediately changes the status to published. We want to intercept this action and show a modal (Dialog) asking the author to provide an excerpt (which was removed from the main editor in Plan 011). This ensures that the metadata is entered right before publishing without cluttering the drafting experience.

## Current state

- `src/app/(article)/_components/publish-button.tsx` — This component renders a standard `<Button>` that immediately triggers `updateArticle` on click.

Excerpt:
```tsx
    startTransition(async () => {
      const res = await updateArticle(publicId, {
        status: 'published',
      });
// ...
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Lint      | `bun run check`          | exit 0              |

## Suggested executor toolkit

- Use `shadcn` components if necessary. The project has `Dialog` from shadcn UI. You can find it at `@/components/ui/dialog`. If it's missing, you may need to install it via `bunx --bun shadcn@latest add dialog` (though it should already be available in most shadcn setups).

## Scope

**In scope** (the only files you should modify):
- `src/app/(article)/_components/publish-button.tsx`
- `src/app/(article)/_components/article-editor.tsx` (only if adjusting `PublishButton` props is necessary)

**Out of scope** (do NOT touch, even though they look related):
- The `updateArticle` server action logic in `lib/article-actions.ts`.

## Git workflow

- Branch: `advisor/012-update-publish-flow`
- Commit per step or per logical unit; message style: conventional commits.

## Steps

### Step 1: Implement Dialog in PublishButton

1. In `src/app/(article)/_components/publish-button.tsx`, import the Dialog components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger` (and optionally `DialogFooter`) from `@/components/ui/dialog`. If the file doesn't exist, ensure you run `bunx --bun shadcn@latest add dialog`.
2. Wrap the existing `Button` with `DialogTrigger`.
3. Add a `DialogContent` with a `DialogHeader` and `DialogTitle` (e.g., "Ready to publish?").
4. Inside the Dialog content, add a simple `form` (or `@tanstack/react-form` if you prefer, but a native form with standard controlled/uncontrolled state is fine) containing a `textarea` for the `excerpt`.
5. Add a "Confirm Publish" submit button inside the dialog.
6. Modify `handlePublish` to take the excerpt value, include it in the `updateArticle` payload (`excerpt`), and close the dialog on success.

**Verify**: `bun run typecheck` → exit 0, no errors

## Test plan

- Ensure that clicking "Publish" opens the dialog instead of instantly saving.
- Ensure that filling the excerpt and clicking "Confirm" publishes the article successfully.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run check` exits 0
- [ ] `PublishButton` renders a Dialog instead of a direct action button.
- [ ] The `updateArticle` payload in `PublishButton` includes both `status: 'published'` and the `excerpt`.

## STOP conditions

Stop and report back (do not improvise) if:
- `updateArticle` action does not accept `excerpt` in its payload.

## Maintenance notes

- This modal could be expanded in the future to include tags, cover image selection, or custom slug input.
