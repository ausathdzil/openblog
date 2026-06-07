'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { Alert, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

const signInOtpFormSchema = z.object({
  otp: z
    .string()
    .check(z.trim(), z.minLength(6, 'OTP must be 6 characters long.')),
});

interface OtpDialogProps {
  email: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    otp: string,
    setFormError: (err: string | null) => void
  ) => Promise<void> | void;
  open: boolean;
  resendType?:
    | 'sign-in'
    | 'email-verification'
    | 'forget-password'
    | 'change-email';
  submitLabel?: string;
}

export function OtpDialog({
  email,
  open,
  onOpenChange,
  submitLabel = 'Confirm',
  resendType = 'sign-in',
  onSubmit,
}: OtpDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        await onSubmit(value.otp, setFormError);
      });
    },
  });

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="max-w-md!">
        <AlertDialogHeader>
          <AlertDialogTitle>Check your email</AlertDialogTitle>
          <AlertDialogDescription>
            If you have an OpenBlog account, we sent a code to{' '}
            <span className="font-semibold">{email}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          className="flex flex-col gap-6"
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="otp"
              validators={{
                onBlur: signInOtpFormSchema.shape.otp,
              }}
            >
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
            <OtpResendButton
              email={email}
              setFormError={setFormError}
              type={resendType}
            />
          </FieldGroup>
        </form>
        <AlertDialogFooter className="grid grid-cols-1">
          <AlertDialogAction disabled={isPending} form="otp-form" type="submit">
            {isPending && <Spinner />}
            {submitLabel}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface OtpResendButtonProps {
  email: string;
  setFormError: (error: string | null) => void;
  type?: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';
}

export function OtpResendButton({
  email,
  setFormError,
  type = 'sign-in',
}: OtpResendButtonProps) {
  const [countdown, setCountdown] = useState(60);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    setIsPending(true);
    setFormError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    });

    setIsPending(false);

    if (error) {
      setFormError(error.message || 'Failed to resend code. Please try again.');
    } else {
      toast.success('Verification code resent successfully.');
      setCountdown(60);
    }
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
