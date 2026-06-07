'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
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

const signInFormSchema = z.object({
  email: z
    .email('Invalid email address.')
    .check(
      z.trim(),
      z.maxLength(100, 'Email must be 100 characters or fewer.')
    ),
});

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        await authClient.emailOtp.sendVerificationOtp(
          {
            email: value.email,
            type: 'sign-in',
          },
          {
            onSuccess: () => {
              setEmailForOtp(value.email);
              setIsOtpDialogOpen(true);
            },
            onError: (ctx) => {
              setFormError(ctx.error.message || 'An unexpected error occurred');
            },
          }
        );
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
          <FieldSeparator />
          <form.Field
            name="email"
            validators={{
              onBlur: signInFormSchema.shape.email,
            }}
          >
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
            <Button disabled={isPending} type="submit">
              {isPending && <Spinner />}
              Continue with Email
            </Button>
            <Button
              onClick={() => setIsOtpDialogOpen(true)}
              type="button"
              variant="outline"
            >
              Test Open Dialog
            </Button>
            <FieldDescription className="text-center">
              Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
            </FieldDescription>
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
        email={emailForOtp}
        onOpenChange={setIsOtpDialogOpen}
        open={isOtpDialogOpen}
      />
    </>
  );
}
