# Plan 013: Add floating and bubble menus to content editor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0b648c1..HEAD -- src/app/\(article\)/_components/content-editor.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `0b648c1`, 2026-06-27

## Why this matters

Currently, users have to rely entirely on Markdown shortcuts (like `**` for bold or `#` for headings) because there are no formatting toolbars. By adding Tiptap's `FloatingMenu` (for block elements on empty lines) and `BubbleMenu` (for inline formatting on selected text), we provide a richer, more accessible authoring experience.

## Current state

- `src/app/(article)/_components/content-editor.tsx` — Uses `@tiptap/react` and renders just `<EditorContent editor={editor} />` at the bottom of the component.

Excerpt:
```tsx
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
// ...
  return <EditorContent editor={editor} />;
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Lint      | `bun run check`          | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/app/(article)/_components/content-editor.tsx`
- You may create new components like `floating-menu.tsx` and `bubble-menu.tsx` in `src/app/(article)/_components/` if extracting them keeps the code cleaner.

**Out of scope**:
- Custom Tiptap extensions. Only use the features provided by `StarterKit` (bold, italic, strike, code, headings, lists, blockquote).

## Git workflow

- Branch: `advisor/013-add-floating-menus`
- Commit per step or per logical unit; message style: conventional commits.

## Steps

### Step 1: Add BubbleMenu for text formatting

1. In `src/app/(article)/_components/content-editor.tsx`, import `BubbleMenu` from `@tiptap/react`.
2. Above `<EditorContent editor={editor} />`, conditionally render `<BubbleMenu editor={editor}>` if `editor` exists.
3. Inside the `BubbleMenu`, add buttons for toggling Bold, Italic, Strikethrough, and Code. Use `@hugeicons/react` or plain text, and style them using Tailwind CSS. 
4. Ensure the buttons use `editor.chain().focus().toggleBold().run()` and apply active styling using `editor.isActive('bold')`.

### Step 2: Add FloatingMenu for block insertion

1. Import `FloatingMenu` from `@tiptap/react`.
2. Add `<FloatingMenu editor={editor}>` next to `BubbleMenu`.
3. Inside the `FloatingMenu`, add buttons for inserting Headings (H1, H2), Bullet List, and Quote.
4. Style the menu as a popover or inline floating bar with Tailwind CSS.

**Verify**: `bun run typecheck` → exit 0, no errors

## Test plan

- Test locally by selecting text to ensure the Bubble Menu appears and formatting works.
- Test locally by placing the cursor on a new empty line to ensure the Floating Menu appears and block insertion works.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run check` exits 0
- [ ] `FloatingMenu` and `BubbleMenu` are rendered and functional.
- [ ] No ESLint or Biome warnings are introduced.

## STOP conditions

Stop and report back (do not improvise) if:
- Tiptap menu components cause hydration errors or styling conflicts that cannot be easily resolved with Tailwind.

## Maintenance notes

- If more advanced extensions are added later (like images or tables), their toggle buttons should be added to these menus.
