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
import { signUp } from '@/lib/auth/client';

const signUpFormSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.email({ error: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Contain at least one special character.',
    })
    .trim(),
});

type SignUpFieldValues = z.infer<typeof signUpFormSchema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpFieldValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: SignUpFieldValues) => {
    await signUp.email(values, {
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
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="name"
                name="name"
                placeholder="John Doe"
                required
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
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
                Creating Account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/sign-in">Sign in</Link>
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
