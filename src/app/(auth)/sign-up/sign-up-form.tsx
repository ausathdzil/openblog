'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  InputGroupText,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

const signUpFormSchema = z.object({
  name: z
    .string()
    .check(
      z.minLength(3, 'Name must be at least 3 characters long.'),
      z.maxLength(30, 'Name must be 30 characters or fewer.'),
      z.trim(),
    ),
  username: z
    .string()
    .check(
      z.minLength(3, 'Username must be at least 3 characters long.'),
      z.maxLength(30, 'Username must be 30 characters or fewer.'),
      z.regex(
        /^[a-zA-Z0-9._]+$/,
        'Username can only contain letters, numbers, underscores, and dots.',
      ),
      z.regex(/^[^0-9].*$/, 'Username cannot start with a number.'),
      z.regex(
        /^(?!\.)(?!.*\.$).+$/,
        'Username cannot start or end with a dot.',
      ),
      z.regex(/^(?!.*\.\.).*$/, 'Username cannot contain consecutive dots.'),
      z.trim(),
    ),
  email: z
    .email('Please enter a valid email.')
    .check(
      z.maxLength(255, 'Email must be 255 characters or fewer.'),
      z.trim(),
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
        'Password must contain at least one special character.',
      ),
    ),
});

type SignUpFieldValues = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();

  const form = useForm<SignUpFieldValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: SignUpFieldValues) => {
    const key = crypto.randomUUID();

    const { data: response } = await authClient.isUsernameAvailable({
      username: values.username,
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          form.setError('root', {
            type: 'manual',
            message: ctx.error.message || 'An unexpected error occurred',
          });
        },
        headers: {
          'Idempotency-Key': key,
        },
      },
    });

    if (response?.available === false) {
      form.setFocus('username');
      form.setError('username', {
        type: 'manual',
        message: 'Username is not available.',
      });
      return;
    }

    await authClient.signUp.email(values, {
      onRequest: () => {
        setLoading(true);
      },
      onResponse: () => {
        setLoading(false);
      },
      onSuccess: () => {
        router.push('/profile');
      },
      onError: (ctx) => {
        form.setError('root', {
          type: 'manual',
          message: ctx.error.message || 'An unexpected error occurred',
        });
      },
      headers: {
        'Idempotency-Key': key,
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="name"
                id={`${id}-name`}
                maxLength={30}
                minLength={3}
                name="name"
                placeholder="Alice"
                required
                spellCheck="false"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-username`}>Username</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>@</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoCapitalize="off"
                  autoComplete="username"
                  autoCorrect="off"
                  id={`${id}-username`}
                  maxLength={30}
                  minLength={3}
                  name="username"
                  placeholder="alice"
                  required
                  spellCheck="false"
                  type="text"
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                id={`${id}-email`}
                maxLength={255}
                name="email"
                placeholder="m@example.com"
                required
                spellCheck="false"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={`${id}-password`}
                  maxLength={128}
                  minLength={8}
                  name="password"
                  required
                  spellCheck="false"
                  type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button disabled={loading} type="submit">
            {loading && <Spinner />}
            Create Account
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </FieldDescription>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
            </Alert>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
