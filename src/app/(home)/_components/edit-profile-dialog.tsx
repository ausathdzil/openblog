'use client';

import { Edit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { auth } from '@/lib/auth';
import { updateProfile } from '../_lib/actions';

interface EditProfileDialogProps {
  user: (typeof auth.$Infer.Session)['user'];
}

const editProfileSchema = z.object({
  image: z.nullable(z.url()),
  name: z
    .string()
    .check(
      z.minLength(3, 'Name must be at least 3 characters long.'),
      z.maxLength(30, 'Name must be 30 characters or fewer.')
    ),
});

export function EditProfileDialog({ user }: EditProfileDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      image: user.image,
      name: user.name,
    },
    validators: {
      onSubmit: editProfileSchema,
    },
    onSubmit: ({ value, formApi }) => {
      startTransition(async () => {
        const { error, message } = await updateProfile(value.image, value.name);

        if (error) {
          formApi.setErrorMap({
            onSubmit: {
              form:
                error.message || 'An unknown error occurred, please try again',
              fields: {},
            },
          });
        } else {
          toast.success(message);
          formApi.reset();
        }
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="justify-self-center"
            size="lg"
            variant="secondary"
          />
        }
      >
        <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
        Edit Profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your name.</DialogDescription>
        </DialogHeader>
        <form
          id="edit-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
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
                      placeholder="John Doe"
                      required
                      spellCheck="false"
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="name"
              validators={{
                onBlur: editProfileSchema.shape.name,
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field orientation="horizontal">
            <Button
              className="w-full"
              disabled={isPending}
              form="edit-profile-form"
              size="lg"
              type="submit"
            >
              {isPending && <Spinner />}
              Save
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
