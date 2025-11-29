'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { signIn } from '@/lib/auth/client';

const signInFormSchema = z.object({
  email: z.email({ error: 'Please enter a valid email.' }).trim(),
  password: z.string({ error: 'Please enter a valid password.' }).trim(),
});

type SignInFieldValues = z.infer<typeof signInFormSchema>;

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFieldValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: SignInFieldValues) => {
    await signIn.email(values, {
      onRequest: () => setLoading(true),
      onResponse: () => {
        setLoading(false);
      },
      onSuccess: () => {
        router.push('/');
      },
      onError: (ctx) => {
        form.setError('root', { message: ctx.error.message });
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
          <h1 className="font-bold text-2xl">Create your account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Fill in the form below to create your account
          </p>
        </div>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="email"
                name="email"
                placeholder="m@example.com"
                required
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid}>
                <InputGroupInput
                  {...field}
                  id="password"
                  name="password"
                  required
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
