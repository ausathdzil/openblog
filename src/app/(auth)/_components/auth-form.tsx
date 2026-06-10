'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod/mini';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { OtpDialog } from './otp-dialog';
import { SignInWithGoogle } from './sign-in-with-google';

const authFormSchema = z.object({
  email: z
    .email('Please enter a valid email.')
    .check(
      z.trim(),
      z.maxLength(100, 'Email must be 100 characters or fewer.')
    ),
});

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const { push } = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: authFormSchema,
    },
    onSubmit: ({ value }) => {
      authClient.emailOtp.sendVerificationOtp(
        {
          email: value.email,
          type: 'sign-in',
        },
        {
          onRequest: () => {
            setFormError(null);
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsOtpDialogOpen(true);
            setIsLoading(false);
          },
          onError: (ctx) => {
            setFormError(
              ctx.error.message ||
                'Failed to send verification email. Please try again.'
            );
            setIsLoading(false);
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

  const handleVerifyOtp = async (
    otp: string,
    setFormError: (error: string | null) => void
  ) => {
    await authClient.signIn.emailOtp(
      {
        email: form.state.values.email,
        otp,
      },
      {
        onSuccess: () => {
          setIsOtpDialogOpen(false);
          push('/setup');
        },
        onError: (ctx) => {
          setFormError(ctx.error.message || 'An unexpected error occurred');
        },
      }
    );
  };

  return (
    <>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        {...props}
      >
        <FieldGroup>
          <SignInWithGoogle onFormError={setFormError} />
          <FieldSeparator>OR</FieldSeparator>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="email"
                    id={field.name}
                    maxLength={100}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="m@example.com"
                    required
                    type="email"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <Field>
            <Button disabled={isLoading} type="submit">
              {isLoading && <Spinner />}
              Continue with Email
            </Button>
            {formError ? (
              <Alert variant="destructive">
                <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
                <AlertTitle>{formError}</AlertTitle>
              </Alert>
            ) : null}
          </Field>
        </FieldGroup>
      </form>
      <OtpDialog
        email={form.state.values.email}
        onOpenChange={setIsOtpDialogOpen}
        onSubmit={handleVerifyOtp}
        open={isOtpDialogOpen}
      />
    </>
  );
}
