'use client';

import {
  AlertCircleIcon,
  AtIcon,
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const signUpFormSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(3, 'Name must be at least 3 characters long.'),
      z.maxLength(30, 'Name must be 30 characters or fewer.')
    ),
  username: z
    .string()
    .check(
      z.trim(),
      z.minLength(3, 'Username must be at least 3 characters long.'),
      z.maxLength(30, 'Username must be 30 characters or fewer.'),
      z.regex(
        /^[a-zA-Z0-9._]+$/,
        'Username can only contain letters, numbers, underscores, and dots.'
      ),
      z.regex(/^[^0-9].*$/, 'Username cannot start with a number.'),
      z.regex(
        /^(?!\.)(?!.*\.$).+$/,
        'Username cannot start or end with a dot.'
      ),
      z.regex(/^(?!.*\.\.).*$/, 'Username cannot contain consecutive dots.')
    ),
  email: z
    .email('Please enter a valid email.')
    .check(
      z.trim(),
      z.maxLength(255, 'Email must be 255 characters or fewer.')
    ),
  password: z
    .string()
    .check(
      z.minLength(8, 'Password must be at least 8 characters long.'),
      z.maxLength(128, 'Password must be 128 characters or fewer.'),
      z.regex(/[a-zA-Z]/, 'Password must contain at least one letter.'),
      z.regex(/[0-9]/, 'Password must contain at least one number.'),
      z.regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character.'
      )
    ),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [loading, setLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const { error } = await authClient.signUp.email(value, {
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="name"
          validators={{
            onBlur: signUpFormSchema.shape.name,
          }}
        />
        <form.Field
          asyncDebounceMs={300}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    {isCheckingUsername ? (
                      <Spinner />
                    ) : (
                      <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
                    )}
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoCapitalize="off"
                    autoComplete="username"
                    autoCorrect="off"
                    id={field.name}
                    maxLength={30}
                    minLength={3}
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
            onBlur: signUpFormSchema.shape.username,
            onChangeAsync: async ({ value }) => {
              const parsed = signUpFormSchema.shape.username.safeParse(value);

              if (!parsed.success) {
                return undefined;
              }

              if (!value || value.trim().length === 0) {
                return undefined;
              }

              const { data, error } = await authClient.isUsernameAvailable(
                {
                  username: value,
                },
                {
                  onRequest: () => {
                    setIsCheckingUsername(true);
                  },
                  onResponse: () => {
                    setIsCheckingUsername(false);
                  },
                }
              );

              if (error) {
                return undefined;
              }

              if (!data?.available) {
                return { message: 'Username is not available.' };
              }

              return undefined;
            },
          }}
        />
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="email"
                  id={field.name}
                  maxLength={255}
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
          name="email"
          validators={{
            onBlur: signUpFormSchema.shape.email,
          }}
        />
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    autoComplete="new-password"
                    id={field.name}
                    maxLength={128}
                    minLength={8}
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
            onBlur: signUpFormSchema.shape.password,
          }}
        />
        <Field>
          <Button disabled={loading} type="submit">
            {loading && <Spinner />}
            Create Account
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/sign-in">Sign in</Link>
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
