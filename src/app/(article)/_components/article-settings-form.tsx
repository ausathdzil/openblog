'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Heading, Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
} from '@/components/ui/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { updateArticle } from '@/lib/article-actions';

const excerptSchema = z.object({
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
  tags: z.array(
    z
      .string()
      .check(
        z.trim(),
        z.maxLength(30, 'Each tag must be 30 characters or fewer.')
      )
  ),
});

export function ArticleSettingsForm({ article }: { article: ArticleResponse }) {
  const { replace, push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInputValue, setTagInputValue] = useState('');

  const form = useForm({
    defaultValues: {
      excerpt: article.excerpt ?? '',
      tags: article.tags?.map((t) => t.name) ?? [],
    },
    validators: {
      onChange: excerptSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const res = await updateArticle(article.publicId, {
          excerpt: value.excerpt,
          tags: value.tags,
          status: 'published',
        });

        if (res?.error) {
          toast.error(res.error.message, { position: 'top-center' });
        } else {
          push(
            `/@${article.author?.username}/articles/${article.slug}` as Route
          );
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
    <form
      className="mx-auto max-w-2xl space-y-6"
      id="article-settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-1.5">
        <Heading>Article Settings</Heading>
        <Muted>
          Changing these details will affect how your article appears in search
          engine results and social previews.
        </Muted>
      </div>

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
                placeholder="A brief summary of your article…"
                value={field.state.value}
              />
              <FieldDescription>
                A short summary of your article for social previews.
              </FieldDescription>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field mode="array" name="tags">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              const newTag = tagInputValue.trim();
              if (newTag && !field.state.value.includes(newTag)) {
                field.handleChange([...field.state.value, newTag]);
              }
              setTagInputValue('');
            }
          };

          return (
            <FieldSet
              className="space-y-1.5"
              data-invalid={isInvalid ? true : undefined}
            >
              <FieldLegend variant="label">Tags</FieldLegend>
              <FieldDescription>
                Press Enter or comma to add a tag. Helps readers discover your
                article.
              </FieldDescription>
              <FieldGroup>
                <Combobox
                  multiple
                  onOpenChange={() => undefined}
                  onValueChange={(val) => {
                    field.handleChange(val as string[]);
                  }}
                  open={false}
                  value={field.state.value}
                >
                  <ComboboxChips>
                    {field.state.value.map((tag, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Tanstack form array fields require index mapping
                      <form.Field key={`tags-${index}`} name={`tags[${index}]`}>
                        {(subField) => {
                          const isSubFieldInvalid =
                            subField.state.meta.isTouched &&
                            !subField.state.meta.isValid;
                          return (
                            <Field
                              data-invalid={
                                isSubFieldInvalid ? true : undefined
                              }
                            >
                              <ComboboxChip value={tag}>{tag}</ComboboxChip>
                              {isSubFieldInvalid && (
                                <FieldError
                                  errors={subField.state.meta.errors}
                                />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    ))}
                    <ComboboxChipsInput
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => setTagInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a tag…"
                      value={tagInputValue}
                    />
                  </ComboboxChips>
                </Combobox>
              </FieldGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          disabled={isPending}
          onClick={() => replace(`/editor/${article.publicId}`)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isPending} form="article-settings-form" type="submit">
          {isPending ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={QuillWrite01Icon} strokeWidth={2} />
          )}
          Publish
        </Button>
      </div>
    </form>
  );
}
