'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircleIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
      z.minLength(1, 'Username is required.'),
      z.maxLength(30, 'Username must be 30 characters or fewer.'),
      z.trim(),
    ),
  password: z
    .string()
    .check(
      z.minLength(1, 'Password is required.'),
      z.maxLength(128, 'Password must be 128 characters or fewer.'),
    ),
  rememberMe: z.optional(z.boolean()),
});

type SignInFieldValues = z.infer<typeof signInFormSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();

  const form = useForm<SignInFieldValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: SignInFieldValues) => {
    await authClient.signIn.username(values, {
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
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={form.handleSubmit(handleSubmit)}
      {...props}
    >
      <FieldGroup>
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
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid}>
                <InputGroupInput
                  {...field}
                  id={`${id}-password`}
                  maxLength={128}
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
                    {showPassword ? (
                      <HugeiconsIcon icon={ViewOffSlashIcon} strokeWidth={2} />
                    ) : (
                      <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="rememberMe"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Checkbox
                aria-invalid={fieldState.invalid}
                checked={field.value}
                id={`${id}-rememberMe`}
                name={field.name}
                onCheckedChange={field.onChange}
              />
              <FieldLabel className="font-normal" htmlFor={`${id}-rememberMe`}>
                Remember Me
              </FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button disabled={loading} type="submit">
            {loading && <Spinner />}
            Sign In
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
          </FieldDescription>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
              <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
            </Alert>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
