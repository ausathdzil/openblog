'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { PasswordToggle } from '@/components/password-toggle';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
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
  revokeOtherSessions: z.boolean(),
});

const CURRENT_PASSWORD_ERROR_PATTERN =
  /current password|invalid password|incorrect password/i;

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverCurrentPasswordError, setServerCurrentPasswordError] = useState<
    string | null
  >(null);

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      revokeOtherSessions: false,
    },
    validators: {
      onSubmit: updatePasswordSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      setServerCurrentPasswordError(null);
      startTransition(async () => {
        await authClient.changePassword(value, {
          onSuccess: () => {
            toast.success('Password updated.');
            form.reset();
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
        });
      });
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
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="currentPassword"
          validators={{
            onChange: updatePasswordSchema.shape.currentPassword,
          }}
        >
          {(field) => {
            const hasClientError =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isInvalid =
              hasClientError || Boolean(serverCurrentPasswordError);

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoComplete="current-password"
                    id={field.name}
                    maxLength={128}
                    minLength={1}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    spellCheck="false"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <PasswordToggle
                    isVisible={showCurrentPassword}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                </InputGroup>
                {hasClientError ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
                {serverCurrentPasswordError ? (
                  <FieldError>{serverCurrentPasswordError}</FieldError>
                ) : null}
              </Field>
            );
          }}
        </form.Field>
        <form.Field
          name="newPassword"
          validators={{
            onChange: updatePasswordSchema.shape.newPassword,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoComplete="new-password"
                    id={field.name}
                    maxLength={128}
                    minLength={8}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    spellCheck="false"
                    type={showNewPassword ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <InputGroupAddon align="inline-end">
                    <PasswordToggle
                      isVisible={showNewPassword}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        {formError ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertTitle>{formError}</AlertTitle>
          </Alert>
        ) : null}
        <Field>
          <Button disabled={isPending} type="submit">
            {isPending && <Spinner />}
            Update Password
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
