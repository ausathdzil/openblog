# Plan 008: Await WebAuthn Promise in auth-form

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result.

## Status
- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Category**: correctness

## Why this matters
In `src/app/(auth)/_components/auth-form.tsx`, the `PublicKeyCredential.isConditionalMediationAvailable?.()` method returns a `Promise<boolean>`, but it's currently being checked synchronously without `await`. This can cause false positives where a truthy Promise object bypasses the check even when the resolved value is false.

## Scope
- `src/app/(auth)/_components/auth-form.tsx`

## Steps

### Step 1: Await the check in a nested async function
Inside the `useEffect` block in `auth-form.tsx` (around line 50), wrap the logic in an internal async function so we can correctly `await` the promise.

Change:
```typescript
  useEffect(() => {
    if (!PublicKeyCredential.isConditionalMediationAvailable?.()) {
      return;
    }

    authClient.signIn.passkey(
      // ...
    );
  }, [push]);
```
To:
```typescript
  useEffect(() => {
    async function checkWebAuthn() {
      if (!(await PublicKeyCredential.isConditionalMediationAvailable?.())) {
        return;
      }

      authClient.signIn.passkey(
        // ...
      );
    }
    checkWebAuthn();
  }, [push]);
```

**Verify**: `bun typecheck` && `bun check`

## Done criteria
- [ ] `isConditionalMediationAvailable` is awaited
