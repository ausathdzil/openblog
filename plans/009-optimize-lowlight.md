# Plan 009: Optimize lowlight language bundle in content editor

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Category**: perf

## Why this matters
The client-side `ContentEditor` imports `common` from `lowlight`, which bundles ~40 programming languages for syntax highlighting. This is heavy for the client bundle. By importing `createLowlight` and registering only the most common languages individually (e.g., HTML, CSS, JS, TS), we can significantly reduce the bundle size.

## Scope
- `src/app/(article)/_components/content-editor.tsx`

## Steps

### Step 1: Selectively import highlight.js languages
In `src/app/(article)/_components/content-editor.tsx`, remove the `import { common } from 'lowlight';` part.
Instead, import specific languages from `highlight.js/lib/languages/*` and register them.

Replace lines 8-12:
```typescript
import { common, createLowlight } from 'lowlight';

import { CodeBlock } from './code-block';

const lowlight = createLowlight(common);
```
With:
```typescript
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import js from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import ts from 'highlight.js/lib/languages/typescript';

import { CodeBlock } from './code-block';

const lowlight = createLowlight();
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('json', json);
```

**Verify**: `bun typecheck` && `bun check`

## Done criteria
- [ ] `common` removed from `lowlight` import.
- [ ] Only specific languages are registered.
