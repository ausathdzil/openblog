'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const authFormSchema = z.object({
  name: z.optional(
    z
      .string()
      .check(
        z.trim(),
        z.minLength(3, 'Name must be at least 3 characters long.'),
        z.maxLength(30, 'Name must be 30 characters or fewer.')
      )
  ),
  email: z
    .email('Please enter a valid email.')
    .check(
      z.trim(),
      z.maxLength(100, 'Email must be 100 characters or fewer.')
    ),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps extends React.ComponentProps<'form'> {
  mode: 'sign-in' | 'sign-up';
}

export function AuthForm({ mode, className, ...props }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const { push } = useRouter();

  const isSignUp = mode === 'sign-up';

  const defaultValues: AuthFormValues = {
    name: isSignUp ? '' : undefined,
    email: '',
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: authFormSchema,
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
              setIsOtpDialogOpen(true);
            },
            onError: (ctx) => {
              setFormError(
                ctx.error.message ||
                  'Failed to send verification email. Please try again.'
              );
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

  const handleVerifyOtp = async (
    otp: string,
    setFormError: (error: string | null) => void
  ) => {
    await authClient.signIn.emailOtp(
      {
        email: form.state.values.email,
        otp,
        ...(isSignUp ? { name: form.state.values.name } : {}),
      },
      {
        onSuccess: () => {
          setIsOtpDialogOpen(false);
          push(isSignUp ? '/username' : '/profile');
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
          <SignInWithGoogle
            label={isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            onFormError={setFormError}
          />
          <FieldSeparator />
          {isSignUp && (
            <form.Field
              name="name"
              validators={{
                onBlur: authFormSchema.shape.name,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="name"
                      autoCorrect="off"
                      id={field.name}
                      maxLength={30}
                      minLength={3}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Alice"
                      required
                      spellCheck="false"
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          )}
          <form.Field
            name="email"
            validators={{
              onBlur: authFormSchema.shape.email,
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
            <FieldDescription className="text-center">
              {isSignUp ? (
                <>
                  Already have an account? <Link href="/sign-in">Sign in</Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <Link href="/sign-up">Sign up</Link>
                </>
              )}
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
        email={form.state.values.email}
        onOpenChange={setIsOtpDialogOpen}
        onSubmit={handleVerifyOtp}
        open={isOtpDialogOpen}
        resendType="sign-in"
        submitLabel={isSignUp ? 'Sign Up' : 'Sign In'}
      />
    </>
  );
}
