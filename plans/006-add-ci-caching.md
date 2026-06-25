# Plan 006: Add CI pipeline dependency and TypeScript caching

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Category**: dx

## Why this matters
The current `.github/workflows/test.yml` pipeline does a slow, clean `bun install` and a full `bun typecheck` on every run. By caching `node_modules` and TypeScript's `.tsbuildinfo` (since `incremental: true` is enabled in `tsconfig.json`), we can drastically reduce CI execution time.

## Scope
- `.github/workflows/test.yml`

## Steps

### Step 1: Add cache steps to `test.yml`
In `.github/workflows/test.yml`, insert `actions/cache@v4` steps immediately after the `Setup Bun` step (before `Install dependencies`).

Add:
```yaml
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-bun-modules-${{ hashFiles('**/bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-modules-

      - name: Cache TypeScript build info
        uses: actions/cache@v4
        with:
          path: .tsbuildinfo
          key: ${{ runner.os }}-tsbuildinfo-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-tsbuildinfo-
```

**Verify**: The YAML is valid and correctly indented.

## Done criteria
- [ ] `node_modules` and `.tsbuildinfo` caching added to `.github/workflows/test.yml`
