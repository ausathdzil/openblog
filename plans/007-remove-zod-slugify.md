# Plan 007: Remove redundant Zod usage for slugifying text

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Category**: perf

## Why this matters
The `utils.ts` file in the Elysia API module imports the entire `zod` library just to use its string parsing and custom `.slugify()` method (or similar) to format slugs. We can achieve this with a simple regex, saving execution time and reducing server-side module loading overhead.

## Scope
- `src/app/elysia/modules/utils.ts`

## Steps

### Step 1: Replace Zod with regex
Remove the `import * as z from 'zod';` and the `const Slug = ...` lines.
Instead, define a simple utility function inside the file:
```typescript
function generateSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, "")
    .replace(/[\\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

### Step 2: Update `slugify` to use it
In the `slugify` function, replace `const base = Slug.parse(input);` with `const base = generateSlug(input);`.

**Verify**: `bun typecheck` && `bun test`

## Done criteria
- [ ] Zod import removed from `utils.ts`
- [ ] Tests pass
