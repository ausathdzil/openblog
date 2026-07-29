'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { Muted, Title } from '@/components/typography';
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
import { OtpForm } from './otp-form';
import { SignInWithGoogle } from './sign-in-with-google';
import { SignInWithPasskey } from './sign-in-with-passkey';

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
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isEmailPending, startEmailTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const { push } = useRouter();

  const isLoading = isPasskeyLoading || isEmailPending;

  useEffect(() => {
    async function checkWebAuthn() {
      if (!(await PublicKeyCredential.isConditionalMediationAvailable?.())) {
        return;
      }

      authClient.signIn.passkey(
        { autoFill: true },
        {
          onRequest: () => {
            setIsPasskeyLoading(true);
            setFormError(null);
          },
          onError: (ctx) => {
            setIsPasskeyLoading(false);
            setFormError(
              ctx.error.message || 'Failed to sign in. Please try again.'
            );
          },
          onSuccess: () => {
            startEmailTransition(() => {
              push('/profile');
            });
          },
        }
      );
    }
    checkWebAuthn();
  }, [push]);

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: authFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      startEmailTransition(async () => {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: value.email,
          type: 'sign-in',
        });

        if (error) {
          setFormError(
            error.message ||
              'Failed to send verification email. Please try again.'
          );
        } else {
          setOtpEmail(value.email);
          form.reset();
        }
      });
    },
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  if (otpEmail) {
    return <OtpForm email={otpEmail} onBack={() => setOtpEmail(null)} />;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Welcome to OpenBlog</Title>
        <Muted className="text-balance">
          Choose a sign in method or enter your email
        </Muted>
      </div>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col gap-2">
            <SignInWithGoogle onFormError={setFormError} />
            <SignInWithPasskey onFormError={setFormError} />
          </div>
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
                    autoComplete="username webauthn"
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
                  {!!isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>
          <Field>
            <Button disabled={isLoading} type="submit">
              {!!isLoading && <Spinner />}
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
    </>
  );
}
