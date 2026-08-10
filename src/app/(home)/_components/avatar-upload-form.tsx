'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useState, useTransition } from 'react';
import * as z from 'zod';

import { Muted } from '@/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { updateAvatar } from '../_lib/actions';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const avatarFormSchema = z.object({
  file: z
    .file('Please select a file.')
    .check(
      z.minSize(1),
      z.maxSize(MAX_AVATAR_SIZE, 'Image must be less than 2MB.'),
      z.mime(AVATAR_TYPES, 'Image must be a JPEG, PNG, or WebP.')
    ),
});

interface AvatarUploadFormProps {
  image?: string | null;
  name: string;
}

export function AvatarUploadForm({ image, name }: AvatarUploadFormProps) {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [preview, setPreview] = useState<string | null>(image ?? null);
  const [isPending, startTransition] = useTransition();

  const { refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onSubmit: avatarFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startTransition(async () => {
        if (!value.file) {
          return;
        }

        const { status, message, url } = await updateAvatar(value.file);

        if (status === 200) {
          setPreview(url ?? null);
          setFormStatus({
            type: 'success',
            message: message || 'Avatar updated.',
          });
          form.reset();
          refresh();
        } else {
          setFormStatus({
            type: 'error',
            message: message || 'Failed to upload avatar.',
          });
        }
      });
    },
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void
  ) => {
    const selected = event.target.files?.[0] ?? null;
    onChange(selected);
    if (!selected) {
      return;
    }
    const parsed = avatarFormSchema.shape.file.safeParse(selected);
    if (!parsed.success) {
      return;
    }
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(selected));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a JPEG, PNG, or WebP image no larger than 2MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar className="mx-auto mb-6 size-32">
          {preview ? <AvatarImage alt={name} src={preview} /> : null}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="file">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="sr-only" htmlFor={field.name}>
                      Profile Picture
                    </FieldLabel>
                    <Input
                      accept={AVATAR_TYPES.join(',')}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        handleFileChange(event, field.handleChange)
                      }
                      required
                      type="file"
                    />
                    {!!isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <Field>
              <Button disabled={isPending} type="submit">
                {!!isPending && <Spinner />}
                Save Changes
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
