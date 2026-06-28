'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

const excerptSchema = z.object({
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
});

export interface ArticleSettingsDialogProps {
  children: React.ReactElement;
  defaultExcerpt?: string;
  description?: string;
  isOpen: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { excerpt: string }) => void;
  submitIcon?: React.ReactNode;
  submitLabel?: React.ReactNode;
  title?: string;
}

export function ArticleSettingsDialog({
  children,
  defaultExcerpt = '',
  description = 'Review your article before publishing. These details will appear on your blog feed and social previews.',
  isOpen,
  isPending,
  onOpenChange,
  onSubmit,
  submitIcon = <HugeiconsIcon icon={QuillWrite01Icon} strokeWidth={2} />,
  submitLabel = 'Publish',
  title = 'Publish Article',
}: ArticleSettingsDialogProps) {
  const form = useForm({
    defaultValues: {
      excerpt: defaultExcerpt,
    },
    validators: {
      onChange: excerptSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          id="article-settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="excerpt">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>Excerpt</FieldLabel>
                  <Textarea
                    className="min-h-32"
                    data-invalid={isInvalid ? true : undefined}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="A brief summary of your article..."
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </form>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            form="article-settings-form"
            type="submit"
          >
            {isPending ? <Spinner /> : submitIcon}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
