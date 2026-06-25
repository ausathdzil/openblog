'use client';

import { AtIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

const profileFormSchema = z.object({
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
});

interface ProfileFormProps {
  defaultName: string;
  defaultUsername?: string;
  redirectPath?: Route;
  submitLabel?: string;
}

export function ProfileForm({
  defaultName,
  defaultUsername = '',
  redirectPath,
  submitLabel = 'Save Changes',
}: ProfileFormProps) {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { push, refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      name: defaultName,
      username: defaultUsername,
    },
    validators: {
      onSubmit: profileFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startTransition(async () => {
        await authClient.updateUser(
          {
            name: value.name,
            username: value.username,
            displayUsername: value.username,
          },
          {
            onSuccess: () => {
              setFormStatus({ type: 'success', message: 'Profile updated' });
              if (redirectPath) {
                push(redirectPath);
              } else {
                refresh();
              }
            },
            onError: (ctx) => {
              setFormStatus({
                type: 'error',
                message: ctx.error.message || 'An unexpected error occurred',
              });
            },
          }
        );
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
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your display name and username.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onChange: profileFormSchema.shape.name,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="name"
                      id={field.name}
                      maxLength={30}
                      minLength={3}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Alice Smith"
                      required
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              asyncDebounceMs={300}
              name="username"
              validators={{
                onChange: profileFormSchema.shape.username,
                onChangeAsync: async ({ value }) => {
                  if (value === defaultUsername) {
                    return;
                  }

                  const parsed =
                    profileFormSchema.shape.username.safeParse(value);

                  if (!parsed.success) {
                    return;
                  }

                  const { data, error } = await authClient.isUsernameAvailable(
                    {
                      username: value,
                    },
                    {
                      onRequest: () => {
                        setIsCheckingUsername(true);
                      },
                      onSuccess: () => {
                        setIsCheckingUsername(false);
                      },
                      onError: () => {
                        setIsCheckingUsername(false);
                      },
                    }
                  );

                  if (error) {
                    return { message: 'Error checking username availability.' };
                  }

                  if (!data.available) {
                    return { message: 'Username is not available.' };
                  }

                  return;
                },
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <Field>
              <Button disabled={isPending} type="submit">
                {isPending && <Spinner />}
                {submitLabel}
              </Button>
              <Muted
                className={cn(
                  formStatus ? 'visible' : 'invisible',
                  formStatus?.type === 'error'
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-500'
                )}
              >
                {formStatus?.message || ' '}
              </Muted>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
