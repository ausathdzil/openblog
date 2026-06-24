'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const { push } = useRouter();

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      PublicKeyCredential.isConditionalMediationAvailable
    ) {
      PublicKeyCredential.isConditionalMediationAvailable().then(
        (available) => {
          if (available) {
            authClient.signIn
              .passkey({
                autoFill: true,
                fetchOptions: {
                  onSuccess: () => {
                    push('/profile');
                  },
                },
              })
              .catch(console.error);
          }
        }
      );
    }
  }, [push]);

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
            setIsLoading(true);
            setFormError(null);
          },
          onSuccess: () => {
            setIsLoading(false);
            setOtpEmail(value.email);
            form.reset();
          },
          onError: (ctx) => {
            setIsLoading(false);
            setFormError(
              ctx.error.message ||
                'Failed to send verification email. Please try again.'
            );
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

  if (otpEmail) {
    return <OtpForm email={otpEmail} onBack={() => setOtpEmail(null)} />;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Welcome to OpenBlog</Title>
        <Muted className="text-balance">
          Get started with Google or enter your email
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
    </>
  );
}
