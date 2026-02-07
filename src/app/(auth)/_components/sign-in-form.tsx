'use client';

import {
  AlertCircleIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm, useStore } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod/mini';

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
  InputGroupButton,
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const { error } = await authClient.signIn.username(value, {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onSuccess: () => {
          router.push('/profile');
        },
      });

      if (error) {
        formApi.setErrorMap({
          onSubmit: {
            form: error.message || 'An unknown error occurred',
            fields: {},
          },
        });
      }
    },
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  const formErrorMap = useStore(form.store, (state) => state.errorMap);

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
          children={(field) => {
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
          name="username"
          validators={{
            onBlur: signInFormSchema.shape.username,
          }}
        />
        <form.Field
          children={(field) => {
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
                    <InputGroupButton
                      aria-label={showPassword ? 'Hide' : 'Show'}
                      onClick={() => setShowPassword(!showPassword)}
                      size="icon-xs"
                      title={showPassword ? 'Hide' : 'Show'}
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="password"
          validators={{
            onBlur: signInFormSchema.shape.password,
          }}
        />
        <form.Field
          children={(field) => {
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
          name="rememberMe"
          validators={{
            onBlur: signInFormSchema.shape.rememberMe,
          }}
        />
        <Field>
          <Button disabled={loading} type="submit">
            {loading && <Spinner />}
            Sign In
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
          </FieldDescription>
          {typeof formErrorMap.onSubmit === 'string' ? (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
              <AlertTitle>{formErrorMap.onSubmit}</AlertTitle>
            </Alert>
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  );
}
