'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as z from 'zod/mini';

import { Muted } from '@/components/typography';
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { updateBio } from '../_lib/actions';

const bioAndLinksFormSchema = z.object({
  bio: z
    .string()
    .check(z.maxLength(500, 'Bio must be 500 characters or fewer.')),
  website: z
    .url()
    .check(z.maxLength(255, 'Website must be 255 characters or fewer.')),
  twitter: z
    .string()
    .check(z.maxLength(15, 'Twitter handle must be 15 characters or fewer.')),
  facebook: z
    .string()
    .check(z.maxLength(50, 'Facebook handle must be 50 characters or fewer.')),
});

type BioAndLinksFormProps = z.infer<typeof bioAndLinksFormSchema>;

export function BioAndLinksForm({
  bio,
  website,
  twitter,
  facebook,
}: BioAndLinksFormProps) {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      bio: bio ?? '',
      website: website ?? '',
      twitter: twitter ?? '',
      facebook: facebook ?? '',
    },
    validators: {
      onSubmit: bioAndLinksFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startTransition(async () => {
        const { status, message } = await updateBio({
          bio: value.bio,
          website: value.website,
          twitter: value.twitter,
          facebook: value.facebook,
        });

        if (status === 200) {
          setFormStatus({ type: 'success', message });
          refresh();
        } else {
          setFormStatus({
            type: 'error',
            message: message || 'Failed to update profile.',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription>Update your bio and social links.</CardDescription>
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
            <form.Field name="bio">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                    <Textarea
                      aria-invalid={isInvalid}
                      id={field.name}
                      maxLength={500}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Tell us about yourself"
                      value={field.state.value}
                    />
                    {!!isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="website">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      maxLength={255}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                      value={field.state.value}
                    />
                    {!!isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="twitter">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Twitter</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>x.com/</InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        maxLength={15}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="username"
                        type="text"
                        value={field.state.value}
                      />
                    </InputGroup>
                    {!!isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="facebook">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Facebook</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>facebook.com/</InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        maxLength={50}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="username"
                        type="text"
                        value={field.state.value}
                      />
                    </InputGroup>
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
