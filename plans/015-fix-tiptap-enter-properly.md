# Plan 015: Fix Tiptap Prosemirror Duplication and Title Navigation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5ad1bf5..HEAD -- src/app/\(article\)/_components/article-editor.tsx package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 014 (conceptually, to fix its shortcomings)
- **Category**: correctness
- **Planned at**: commit `5ad1bf5`, 2026-06-27

## Why this matters

The previous attempt to fix the Enter key bug (Plan 014) did not resolve the issue due to a dependency conflict: Tiptap is loading multiple versions of `prosemirror-model` (v1.25.4 and v1.25.7) which causes a `RangeError: Can not convert <> to a Fragment` whenever the Enter key (or any block-splitting command) is used. We need to deduplicate `prosemirror-model` using Bun overrides.
Additionally, the Title Enter key navigation fails to set focus into the Tiptap editor correctly. Deferring the focus call slightly via `setTimeout` typically resolves this native DOM focus quirk in React/Tiptap.

## Current state

- `package.json` — Does not enforce a single version of `prosemirror-model`.
- `src/app/(article)/_components/article-editor.tsx` — The title `handleTitleEnter` calls `focus()` synchronously.

Excerpt of `src/app/(article)/_components/article-editor.tsx`:
```tsx
function handleTitleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
    editorEl?.focus();
  }
}
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Lint      | `bun run check`          | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `package.json`
- `bun.lock` (will be updated implicitly by `bun install`)
- `src/app/(article)/_components/article-editor.tsx`

**Out of scope**:
- Reverting changes made in `content-editor.tsx` from Plan 014 (they are fine as-is).

## Git workflow

- Branch: `advisor/015-fix-tiptap-enter-properly`
- Commit per step or per logical unit; message style: conventional commits.

## Steps

### Step 1: Deduplicate prosemirror-model

1. Open `package.json`.
2. Locate the `"overrides"` object.
3. Add `"prosemirror-model": "^1.25.7"` to the `"overrides"` object.
   *(Note: The project uses Bun, which respects the `overrides` field just like npm)*.
4. Run `bun install` to regenerate the lockfile and deduplicate the dependencies.

**Verify**: `bun pm ls prosemirror-model` → Should only list one version deduplicated across the tree.

### Step 2: Fix Title Navigation Focus

1. In `src/app/(article)/_components/article-editor.tsx`, modify `handleTitleEnter` to wrap the focus call in a `setTimeout(..., 0)`.
```tsx
function handleTitleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter') {
    e.preventDefault();
    setTimeout(() => {
      const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
      editorEl?.focus();
    }, 0);
  }
}
```

**Verify**: `bun run typecheck` → exit 0, no errors

## Test plan

- Test locally: Pressing Enter on the title field should successfully focus the content editor.
- Test locally: Pressing Enter inside the content editor should insert a new line without crashing the app.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `package.json` contains `prosemirror-model` in `overrides`.
- [ ] `handleTitleEnter` uses `setTimeout`.

## STOP conditions

Stop and report back (do not improvise) if:
- `bun install` fails due to conflicts with the override.
