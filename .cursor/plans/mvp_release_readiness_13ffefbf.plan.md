---
name: MVP release readiness
overview: Assess whether OpenBlog is close to MVP and define a minimal set of release blockers to address before shipping.
todos:
  - id: error-safety
    content: Update global error UX for production-safe messaging and include reset flow.
    status: pending
  - id: env-validation
    content: Add runtime env validation for required secrets/URLs/DB connection.
    status: pending
  - id: typecheck-gate
    content: Add explicit typecheck command for CI and align Next.js build behavior with CI guarantees.
    status: pending
  - id: ci-quality-gates
    content: Add CI workflow after local release blockers are closed; keep it as release hardening step.
    status: pending
isProject: false
---

# MVP Release Readiness Check

OpenBlog appears **close to MVP**: core auth, authoring, publish/archive/delete, profile, home feed, and explore/search are implemented. The main risk is not core feature completeness, but release hardening.

## Current Verdict

- **Likely close (about 80-90%)** for MVP scope.
- **No-go until P0 blockers are closed**.

## P0 Blockers (fix before release)

- Update `[src/app/global-error.tsx](src/app/global-error.tsx)` to show user-friendly production text and include a `reset()` retry action. Keep digest display for support/debug workflows and avoid exposing raw server details in production.
- Validate critical env vars at startup (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and production-safe app URL handling): `[.env.example](.env.example)`, `[src/db/index.ts](src/db/index.ts)`, `[src/lib/auth.ts](src/lib/auth.ts)`, `[src/lib/eden.ts](src/lib/eden.ts)`.
- Add an explicit type-check gate for CI (for example `tsc --noEmit` in `[package.json](package.json)`), then decide whether to set `typescript.ignoreBuildErrors` in `[next.config.ts](next.config.ts)` based on CI reliability.
- Keep CI in scope but lower priority for this pass: add a workflow under `.github/workflows/` after the above blockers are addressed.

## Deferred To Separate Plan

- Former P1 items have been moved to a dedicated post-MVP hardening plan file.

## Evidence Snippets (non-obvious)

```49:52:src/app/global-error.tsx
<EmptyContent>
  <EmptyDescription>Message: {error.message}</EmptyDescription>
  <EmptyTitle>Digest: {error.digest}</EmptyTitle>
</EmptyContent>
```

## Suggested Release Gate

- Global error screen is production-friendly and supports retry via `reset()`.
- Production env validation passes.
- Typecheck runs as a mandatory CI step (`tsc --noEmit` equivalent).
- CI workflow is added and green (lint + typecheck + tests where tests can run via `bun test` directly; a `test` script is optional).
- Manual smoke test of core journeys: sign up, sign in, create draft, edit, publish, read public article, archive, delete.
