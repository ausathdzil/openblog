---
name: profile edit page split
overview: Move profile editing from modal dialog to a dedicated page, add separate forms for name and password updates, and standardize on Better Auth APIs already used in the codebase.
todos:
  - id: add-profile-edit-route
    content: Create dedicated `/profile/edit` page and replace profile dialog trigger with page link.
    status: pending
  - id: split-forms
    content: Implement separate Update Name and Update Password form components with independent validation and submit states.
    status: pending
  - id: auth-actions
    content: Use Better Auth client mutation APIs with `onRequest`/`onResponse`/`onError`/`onSuccess` handlers (no `try/catch`) for name/password updates.
    status: pending
  - id: accessibility-attrs
    content: Apply required HTML autocomplete/name/id/aria attributes and invalid-focus behavior for both forms.
    status: pending
  - id: route-protection-and-cleanup
    content: Remove obsolete dialog component/imports and keep route protection unchanged (existing `/profile` guard already covers `/profile/edit`).
    status: pending
  - id: verify-behavior
    content: Run targeted validation of form UX, auth errors, and profile data refresh behavior.
    status: pending
isProject: false
---

# Move Edit Profile to Dedicated Page

## Scope and goals

- Replace the current modal-based profile editing UX with a dedicated page route.
- Keep profile viewing on existing profile page, but link to the new settings/edit page.
- Add two independent forms:
  - **Update Name** (`name` input + confirm)
  - **Update Password** (`currentPassword` + `newPassword` + confirm)
- Use Better Auth client mutation APIs directly and consistently in forms:
  - `authClient.updateUser` for name changes
  - `authClient.changePassword` for password changes
- Handle mutation lifecycle with Better Auth callback options (`onRequest`, `onResponse`, `onError`, `onSuccess`) instead of `try/catch`.
- Exclude email verification/reset-email flows for now.

## Current implementation to replace

- Profile edit is currently a dialog in `[/home/ausath/Projects/openblog/src/app/(home)/_components/edit-profile-dialog.tsx](</home/ausath/Projects/openblog/src/app/(home)`/components/edit-profile-dialog.tsx>).
- The server action currently updates profile name via `auth.api.updateUser` in `[/home/ausath/Projects/openblog/src/app/(home)/_lib/actions.ts](</home/ausath/Projects/openblog/src/app/(home)`/lib/actions.ts>).
- Profile page currently renders the dialog in `[/home/ausath/Projects/openblog/src/app/(home)/profile/page.tsx](</home/ausath/Projects/openblog/src/app/(home)`/profile/page.tsx>).

Existing pattern to replace:

```44:52:/home/ausath/Projects/openblog/src/app/(home)/_lib/actions.ts
export async function updateProfile(
  image: string | null | undefined,
  name: string
) {
  try {
    await auth.api.updateUser({
      body: { image, name },
      headers: await headers(),
    });
```

## Proposed route and UI structure

- Add a new protected route page: `[/home/ausath/Projects/openblog/src/app/(home)/profile/edit/page.tsx](</home/ausath/Projects/openblog/src/app/(home)`/profile/edit/page.tsx>).
- In profile view page, replace `EditProfileDialog` with a link/button to `/profile/edit`.
- Keep navigation unchanged (`/profile` remains account entry point), with settings/edit reached from profile page CTA.

## Form components and actions

- Add page-local client form components under `[/home/ausath/Projects/openblog/src/app/(home)/profile/edit/_components](</home/ausath/Projects/openblog/src/app/(home)`/profile/edit/components>):
  - `update-name-form.tsx`
  - `update-password-form.tsx`
- Implement auth mutations directly in the client forms using `authClient`:
  - Name form calls `authClient.updateUser(...)`.
  - Password form calls `authClient.changePassword(...)`.
- Use Better Auth callback options for async state and feedback:
  - `onRequest` to set pending/loading state
  - `onResponse` to clear pending/loading state
  - `onError` to map error message to form-level errors
  - `onSuccess` to show success toast and reset targeted fields
- Remove dependency on profile mutation server actions for these two form submissions.

## Accessibility and UX requirements to enforce

- **Update Name form**
  - `input type="text"`
  - `name="name"`, `id`, `autoComplete="name"`, `required`, `minLength`, `maxLength`
  - default value from current session name and placeholder set to the same current name
  - error message bound to input via `aria-invalid` + `aria-describedby`
- **Update Password form**
  - current password: `type="password"`, `name="currentPassword"`, `autoComplete="current-password"`, `required`
  - new password: `type="password"`, `name="newPassword"`, `autoComplete="new-password"`, `required`, `minLength`, `maxLength`
  - add descriptive help text for password rules and connect via `aria-describedby`
- **Both forms**
  - separate `<form>` elements with their own submit buttons and loading states
  - keep submit enabled until request starts, then disable and show spinner
  - `onSubmitInvalid` focus first invalid control
  - preserve keyboard-first semantics and visible focus states via existing UI primitives

## Routing and protection updates

- Keep `[/home/ausath/Projects/openblog/src/proxy.ts](/home/ausath/Projects/openblog/src/proxy.ts)` unchanged.
- Rely on existing `/profile` protected-route behavior, which already covers `/profile/edit`.

## Cleanup

- Remove dialog dependency from profile page and delete obsolete dialog component file:
  - `[/home/ausath/Projects/openblog/src/app/(home)/_components/edit-profile-dialog.tsx](</home/ausath/Projects/openblog/src/app/(home)`/components/edit-profile-dialog.tsx>)
- Verify no remaining imports/usages.

## Verification checklist

- Name update succeeds and persists; `/profile` reflects updated name after revalidation.
- Password change succeeds with valid current password and strong new password.
- Incorrect current password surfaces accessible inline error.
- Both forms work independently (submitting one does not reset/affect the other).
- Mutation lifecycle wiring is callback-based (`onRequest`/`onResponse`/`onError`/`onSuccess`) with no `try/catch` in form submit handlers.
- Keyboard navigation and screen-reader labels/attributes are correct.
- Existing `/profile` route protection still blocks unauthenticated access to `/profile/edit`.
