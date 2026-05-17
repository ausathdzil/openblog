'use client';

import {
  AlertCircleIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

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
  InputGroupButton,
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
});

const CURRENT_PASSWORD_ERROR_PATTERN =
  /current password|invalid password|incorrect password/i;

export function UpdatePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setFormError(null);
            setServerCurrentPasswordError(null);
            form.reset();
          },
        }
      );
    },
    onSubmitInvalid() {
      const $invalidInput = formRef.current?.querySelector(
        '[aria-invalid="true"]'
      );

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
      ref={formRef}
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
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupInput
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
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        showCurrentPassword
                          ? 'Hide current password'
                          : 'Show current password'
                      }
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      size="icon-xs"
                      title={
                        showCurrentPassword
                          ? 'Hide current password'
                          : 'Show current password'
                      }
                      type="button"
                      variant="ghost"
                    >
                      {showCurrentPassword ? (
                        <HugeiconsIcon
                          icon={ViewOffSlashIcon}
                          strokeWidth={2}
                        />
                      ) : (
                        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
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
            onChange: updatePasswordSchema.shape.currentPassword,
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
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupInput
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
                    type={showNewPassword ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        showNewPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      size="icon-xs"
                      title={
                        showNewPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                      type="button"
                      variant="ghost"
                    >
                      {showNewPassword ? (
                        <HugeiconsIcon
                          icon={ViewOffSlashIcon}
                          strokeWidth={2}
                        />
                      ) : (
                        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
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
            onChange: updatePasswordSchema.shape.newPassword,
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
