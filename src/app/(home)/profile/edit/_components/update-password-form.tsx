'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .check(
      z.minLength(1, 'Current password is required.'),
      z.maxLength(128, 'Current password must be 128 characters or fewer.')
    ),
  newPassword: z
    .string()
    .check(
      z.minLength(8, 'New password must be at least 8 characters long.'),
      z.maxLength(128, 'New password must be 128 characters or fewer.'),
      z.regex(/[a-zA-Z]/, 'New password must include at least one letter.'),
      z.regex(/[0-9]/, 'New password must include at least one number.'),
      z.regex(
        /[^a-zA-Z0-9]/,
        'New password must include at least one special character.'
      )
    ),
});

const CURRENT_PASSWORD_ERROR_PATTERN =
  /current password|invalid password|incorrect password/i;

export function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverCurrentPasswordError, setServerCurrentPasswordError] = useState<
    string | null
  >(null);
  const newPasswordDescriptionId = useId();
  const currentPasswordErrorId = useId();
  const newPasswordErrorId = useId();

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    validators: {
      onSubmit: updatePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: false,
        },
        {
          onRequest: () => {
            setLoading(true);
            setFormError(null);
            setServerCurrentPasswordError(null);
          },
          onResponse: () => {
            setLoading(false);
          },
          onError: (ctx) => {
            const message =
              ctx.error.message ||
              'Unable to update your password, please try again.';

            if (CURRENT_PASSWORD_ERROR_PATTERN.test(message)) {
              setServerCurrentPasswordError(message);
              return;
            }

            setFormError(message);
          },
          onSuccess: () => {
            toast.success('Password updated.');
            form.reset();
          },
        }
      );
    },
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          children={(field) => {
            const hasClientError =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isInvalid =
              hasClientError || Boolean(serverCurrentPasswordError);

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                <Input
                  aria-describedby={
                    isInvalid ? currentPasswordErrorId : undefined
                  }
                  aria-invalid={isInvalid}
                  autoComplete="current-password"
                  id={field.name}
                  maxLength={128}
                  minLength={1}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    setServerCurrentPasswordError(null);
                    setFormError(null);
                    field.handleChange(e.target.value);
                  }}
                  required
                  spellCheck="false"
                  type="password"
                  value={field.state.value}
                />
                {hasClientError ? (
                  <FieldError
                    errors={field.state.meta.errors}
                    id={currentPasswordErrorId}
                  />
                ) : serverCurrentPasswordError ? (
                  <FieldError id={currentPasswordErrorId}>
                    {serverCurrentPasswordError}
                  </FieldError>
                ) : null}
              </Field>
            );
          }}
          name="currentPassword"
          validators={{
            onBlur: updatePasswordSchema.shape.currentPassword,
          }}
        />
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const describedBy = `${newPasswordDescriptionId}${isInvalid ? ` ${newPasswordErrorId}` : ''}`;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <Input
                  aria-describedby={describedBy}
                  aria-invalid={isInvalid}
                  autoComplete="new-password"
                  id={field.name}
                  maxLength={128}
                  minLength={8}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    setFormError(null);
                    field.handleChange(e.target.value);
                  }}
                  required
                  spellCheck="false"
                  type="password"
                  value={field.state.value}
                />
                <FieldDescription id={newPasswordDescriptionId}>
                  Use 8-128 characters with at least one letter, one number, and
                  one special character.
                </FieldDescription>
                {isInvalid && (
                  <FieldError
                    errors={field.state.meta.errors}
                    id={newPasswordErrorId}
                  />
                )}
              </Field>
            );
          }}
          name="newPassword"
          validators={{
            onBlur: updatePasswordSchema.shape.newPassword,
          }}
        />
        {formError ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertTitle>{formError}</AlertTitle>
          </Alert>
        ) : null}
        <Field>
          <Button disabled={loading} type="submit">
            {loading && <Spinner />}
            Update Password
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
