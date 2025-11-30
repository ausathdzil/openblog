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
import { Checkbox } from '@/components/ui/checkbox';
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
import { authClient } from '@/lib/auth/client';

const signInFormSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email.' })
    .max(255, { error: 'Email must be 255 characters or fewer.' })
    .trim(),
  password: z
    .string()
    .min(1, { error: 'Password is required.' })
    .max(128, { error: 'Password must be 128 characters or fewer.' })
    .trim(),
  rememberMe: z.optional(z.boolean()),
});

type SignInFieldValues = z.infer<typeof signInFormSchema>;

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();

  const form = useForm<SignInFieldValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: SignInFieldValues) => {
    const key = crypto.randomUUID();

    await authClient.signIn.email(values, {
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
        form.setError('root', { message: ctx.error.message });
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
              <InputGroup aria-invalid={fieldState.invalid}>
                <InputGroupInput
                  {...field}
                  id={`${id}-password`}
                  maxLength={128}
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
              {fieldState.invalid && (
                <>
                  <FieldDescription>Password Must:</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
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
            {loading ? (
              <>
                <Spinner />
                Signing In…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{' '}
            <Link className="underline underline-offset-4" href="/sign-up">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
        {form.formState.errors.root && (
          <Field>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
            </Alert>
          </Field>
        )}
      </FieldGroup>
    </form>
  );
}
