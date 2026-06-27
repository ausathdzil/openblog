# Plan 014: Fix editor Enter key bugs and title navigation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5ad1bf5..HEAD -- src/app/\(article\)/_components/article-editor.tsx src/app/\(article\)/_components/content-editor.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness
- **Planned at**: commit `5ad1bf5`, 2026-06-27

## Why this matters

The editor currently has two major usability bugs involving the Enter key:
1. Pressing Enter in the Title field does nothing (it prevents default behavior, but it should intuitively move focus to the content editor).
2. Users report being unable to press Enter to insert a new line in the Content Editor itself. This is a severe disruption to the authoring flow.

## Current state

- `src/app/(article)/_components/article-editor.tsx` — The title `ResizableTextarea` has an `onKeyDown` handler:
```tsx
function handlePreventEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
}
```
This currently just halts the event.

- `src/app/(article)/_components/content-editor.tsx` — Initializes the Tiptap editor with `@tiptap/markdown` and `StarterKit`. The bug with Enter not creating new lines could be related to `tiptap-markdown` parsing, or potentially a missing HardBreak extension, or a form wrapper interfering.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Lint      | `bun run check`          | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/app/(article)/_components/article-editor.tsx`
- `src/app/(article)/_components/content-editor.tsx`

**Out of scope** (do NOT touch, even though they look related):
- Changes to the underlying Tiptap library node_modules. Use config options or extension overrides.

## Git workflow

- Branch: `advisor/014-fix-editor-enter-bugs`
- Commit per step or per logical unit; message style: conventional commits.

## Steps

### Step 1: Route Title Enter key to Content Editor

1. In `src/app/(article)/_components/article-editor.tsx`, modify the title's `onKeyDown` handler. Instead of just `handlePreventEnter`, write a handler that prevents default AND focuses the Tiptap editor.
2. Since Tiptap applies standard classes to its contenteditable element, you can implement this safely by finding `.tiptap` or `.ProseMirror` in the DOM:
```tsx
const handleTitleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
    editorEl?.focus();
  }
};
```
3. Attach this `handleTitleEnter` to the Title's `ResizableTextarea`.

### Step 2: Fix Content Editor Enter key bug

1. Investigate why Enter is not creating new lines in `src/app/(article)/_components/content-editor.tsx`. 
2. Ensure that `StarterKit` isn't inadvertently disabling the `Paragraph` or `HardBreak` nodes. 
3. Check if the parent `<form>` is improperly intercepting standard `Enter` key events within the `contenteditable` container. (Note: standard form behavior normally ignores Enter inside contenteditable, but check if TanStack Form or Next.js React 19 behaves differently).
4. Check if the `Markdown` extension (`@tiptap/markdown`) requires a specific configuration (`transformPastedText: true` or `breaks: true`) to parse newlines properly.
5. Apply the necessary configuration or fix to `content-editor.tsx` so the Enter key correctly breaks lines again. If it requires updating `@tiptap/markdown`, bump the version in `package.json`.

**Verify**: `bun run typecheck` → exit 0, no errors

## Test plan

- Test locally: pressing Enter on the title field should focus the content editor below.
- Test locally: pressing Enter inside the content editor should create a new paragraph or line break.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run check` exits 0
- [ ] Title Enter key focuses the editor.
- [ ] Enter key creates new lines in the editor.

## STOP conditions

Stop and report back (do not improvise) if:
- Fixing the Enter key in Tiptap requires removing `@tiptap/markdown` entirely. (We need markdown serialization).

## Maintenance notes

- Future additions of keyboard shortcuts should ensure they do not collide with native DOM focus methods or `contenteditable` behaviors.
