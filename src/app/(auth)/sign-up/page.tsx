'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Muted, Title } from '@/components/typography';
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
    .min(3, { error: 'Name must be at least 3 characters long.' })
    .max(30, { error: 'Name must be 30 characters or fewer.' })
    .trim(),
  username: z
    .string()
    .min(3, { error: 'Username must be at least 3 characters long.' })
    .max(30, { error: 'Username must be 30 characters or fewer.' })
    .regex(/^[a-zA-Z0-9._]+$/, {
      error:
        'Username can only contain letters, numbers, underscores, and dots.',
    })
    .regex(/^[^0-9].*$/, {
      error: 'Username cannot start with a number.',
    })
    .regex(/^(?!\.)(?!.*\.$).+$/, {
      error: 'Username cannot start or end with a dot.',
    })
    .regex(/^(?!.*\.\.).*$/, {
      error: 'Username cannot contain consecutive dots.',
    })
    .trim(),
  email: z
    .email({ error: 'Please enter a valid email.' })
    .max(255, { error: 'Email must be 255 characters or fewer.' })
    .trim(),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long.' })
    .max(128, { error: 'Password must be 128 characters or fewer.' })
    .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Password must contain at least one special character.',
    })
    .trim(),
});

type SignUpFieldValues = z.infer<typeof signUpFormSchema>;

export default function SignUpPage() {
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
            message: ctx.error.message,
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
          message: ctx.error.message,
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
        <div className="flex flex-col items-center gap-1 text-center">
          <Title className="text-2xl">Create your account</Title>
          <Muted className="text-balance">
            Fill in the form below to create your account
          </Muted>
        </div>
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
                  autoComplete="username"
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
            {loading ? (
              <>
                <Spinner />
                Creating Account…
              </>
            ) : (
              'Create Account'
            )}
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
