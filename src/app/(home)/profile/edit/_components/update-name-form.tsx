'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

const updateNameSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(3, 'Name must be at least 3 characters long.'),
      z.maxLength(30, 'Name must be 30 characters or fewer.')
    ),
});

interface UpdateNameFormProps {
  currentName: string;
}

export function UpdateNameForm({ currentName }: UpdateNameFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverNameError, setServerNameError] = useState<string | null>(null);
  const { refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      name: currentName,
    },
    validators: {
      onSubmit: updateNameSchema,
    },
    onSubmit: ({ value }) => {
      setServerNameError(null);
      startTransition(async () => {
        await authClient.updateUser(value, {
          onRequest: () => {
            setServerNameError(null);
          },
          onSuccess: () => {
            toast.success('Name updated.');
            refresh();
          },
          onError: (ctx) => {
            setServerNameError(
              ctx.error.message ||
                'Unable to update your name, please try again.'
            );
          },
        });
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
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
          validators={{
            onBlur: updateNameSchema.shape.name,
          }}
        >
          {(field) => {
            const hasClientError =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isInvalid = hasClientError || Boolean(serverNameError);

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
                  placeholder={currentName}
                  required
                  spellCheck="false"
                  type="text"
                  value={field.state.value}
                />
                <FieldDescription>
                  Enter the name displayed on your profile.
                </FieldDescription>
                {hasClientError ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
                {serverNameError ? (
                  <FieldError>{serverNameError}</FieldError>
                ) : null}
              </Field>
            );
          }}
        </form.Field>
        <Field>
          <Button disabled={isPending} type="submit">
            {isPending && <Spinner />}
            Update Name
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
