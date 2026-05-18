'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { PasswordToggle } from '@/components/password-toggle';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const signInFormSchema = z.object({
  username: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, 'Username is required.'),
      z.maxLength(30, 'Username must be 30 characters or fewer.')
    ),
  password: z
    .string()
    .check(
      z.minLength(1, 'Password is required.'),
      z.maxLength(128, 'Password must be 128 characters or fewer.')
    ),
  rememberMe: z.boolean(),
});

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { push } = useRouter();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        await authClient.signIn.username(value, {
          onSuccess: () => {
            push('/profile');
          },
          onError: (ctx) => {
            setFormError(ctx.error.message || 'An unexpected error occurred');
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
      className={cn('flex flex-col gap-6', className)}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      {...props}
    >
      <FieldGroup>
        <form.Field
          name="username"
          validators={{
            onBlur: signInFormSchema.shape.username,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>@</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoCapitalize="off"
                    autoComplete="username"
                    autoCorrect="off"
                    id={field.name}
                    maxLength={30}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="alice"
                    required
                    spellCheck="false"
                    type="text"
                    value={field.state.value}
                  />
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onBlur: signInFormSchema.shape.password,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    id={field.name}
                    maxLength={128}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    spellCheck="false"
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <InputGroupAddon align="inline-end">
                    <PasswordToggle
                      isVisible={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field
          name="rememberMe"
          validators={{
            onBlur: signInFormSchema.shape.rememberMe,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} orientation="horizontal">
                <Checkbox
                  aria-invalid={isInvalid}
                  checked={field.state.value}
                  id={field.name}
                  name={field.name}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                />
                <FieldLabel className="font-normal" htmlFor={field.name}>
                  Remember Me
                </FieldLabel>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <Field>
          <Button disabled={isPending} type="submit">
            {isPending && <Spinner />}
            Sign In
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
  );
}
