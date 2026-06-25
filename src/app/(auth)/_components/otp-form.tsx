'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { Muted, Title } from '@/components/typography';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const signInOtpFormSchema = z.object({
  otp: z
    .string()
    .check(z.trim(), z.minLength(6, 'OTP must be 6 characters long.')),
});

interface OtpFormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  email: string;
  onBack?: () => void;
}

export function OtpForm({ email, onBack, className, ...props }: OtpFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const form = useForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onSubmit: signInOtpFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        const { data } = await authClient.signIn.emailOtp(
          {
            email,
            otp: value.otp,
          },
          {
            onError: (ctx) => {
              setFormError(ctx.error.message || 'An unexpected error occurred');
            },
          }
        );

        if (data?.user.username && data.user.name) {
          push('/profile');
        } else {
          push('/setup');
        }
      });
    },
  });

  if (!email) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Check your email</Title>
        <Muted className="text-balance">
          If you have an OpenBlog account, we sent a code to{' '}
          <span className="font-semibold text-foreground">{email}</span>.
        </Muted>
      </div>
      <form
        className={cn('flex flex-col gap-6', className)}
        id="otp-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        {...props}
      >
        <FieldGroup>
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>
                    OTP
                  </FieldLabel>
                  <InputOTP
                    aria-invalid={isInvalid}
                    autoComplete="one-time-code"
                    containerClassName="justify-center"
                    disabled={isPending}
                    id={field.name}
                    inputMode="numeric"
                    maxLength={6}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(val) => field.handleChange(val)}
                    required
                    type="text"
                    value={field.state.value}
                  >
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && (
                    <FieldError
                      className="text-center"
                      errors={field.state.meta.errors}
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
          {formError ? (
            <Field>
              <Alert variant="destructive">
                <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
                <AlertTitle>{formError}</AlertTitle>
              </Alert>
            </Field>
          ) : null}
        </FieldGroup>
        <div className="flex flex-col gap-2">
          <Button disabled={isPending} type="submit">
            {isPending && <Spinner />}
            Verify
          </Button>
          <OtpResendButton email={email} setFormError={setFormError} />
          {onBack && (
            <Button
              disabled={isPending}
              onClick={onBack}
              type="button"
              variant="ghost"
            >
              Change Email
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

interface OtpResendButtonProps {
  email: string;
  setFormError: (error: string | null) => void;
}

export function OtpResendButton({ email, setFormError }: OtpResendButtonProps) {
  const [countdown, setCountdown] = useState(60);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (countdown === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    setFormError(null);
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });

      if (error) {
        setFormError(
          error.message || 'Failed to resend code. Please try again.'
        );
      } else {
        toast.success('Verification code resent successfully.');
        setCountdown(60);
      }
    });
  };

  const isDisabled = isPending || countdown > 0;
  const labelText =
    countdown > 0 ? `Resend Code (${countdown})` : 'Resend Code';

  return (
    <Button
      className="tabular-nums"
      disabled={isDisabled}
      onClick={handleResend}
      type="button"
      variant="outline"
    >
      {isPending && <Spinner />}
      {labelText}
    </Button>
  );
}
