'use client';

import { AlertCircleIcon, AtIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { Alert, AlertTitle } from '@/components/ui/alert';
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

const setupFormSchema = z.object({
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

interface SetupFormProps {
  defaultName: string;
}

export function SetupForm({ defaultName }: SetupFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const form = useForm({
    defaultValues: {
      name: defaultName,
      username: '',
    },
    validators: {
      onSubmit: setupFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        await authClient.updateUser(
          {
            name: value.name,
            username: value.username,
            displayUsername: value.username,
          },
          {
            onSuccess: () => {
              push('/profile');
            },
            onError: (ctx) => {
              setFormError(ctx.error.message || 'An unexpected error occurred');
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
            onChange: setupFormSchema.shape.name,
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          asyncDebounceMs={300}
          name="username"
          validators={{
            onChange: setupFormSchema.shape.username,
            onChangeAsync: async ({ value }) => {
              const parsed = setupFormSchema.shape.username.safeParse(value);

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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <Button disabled={isPending} type="submit">
            {isPending && <Spinner />}
            Continue
          </Button>
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
