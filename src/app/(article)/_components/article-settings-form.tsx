/** biome-ignore-all lint/suspicious/noArrayIndexKey: TanStack Form array mode */
'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import * as z from 'zod/mini';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Heading, Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
} from '@/components/ui/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Kbd } from '@/components/ui/kbd';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { updateArticle } from '@/lib/article-actions';
import { CoverImageForm, type CoverImageFormHandle } from './cover-image-form';

const excerptSchema = z.object({
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
  tags: z
    .array(
      z
        .string()
        .check(
          z.trim(),
          z.maxLength(50, 'Each tag must be 50 characters or fewer.')
        )
    )
    .check(z.maxLength(5, 'You can only add up to 5 tags.')),
});

export function ArticleSettingsForm({ article }: { article: ArticleResponse }) {
  const { replace, push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInputValue, setTagInputValue] = useState('');
  const coverImageRef = useRef<CoverImageFormHandle>(null);

  const form = useForm({
    defaultValues: {
      excerpt: article.excerpt ?? '',
      tags: article.tags?.map((t) => t.name) ?? [],
    },
    validators: {
      onChange: excerptSchema,
    },
    onSubmit: ({ value }) => {
      if (coverImageRef.current?.hasPendingFile()) {
        toast.add({
          type: 'error',
          description:
            "You selected a cover image but haven't uploaded it yet. Please upload or remove it before publishing.",
        });
        coverImageRef.current.focusInput();
        return;
      }
      startTransition(async () => {
        const { status, message } = await updateArticle(article.publicId, {
          excerpt: value.excerpt,
          tags: value.tags,
          status: 'published',
        });

        if (status === 200) {
          push(
            `/@${article.author?.username}/articles/${article.slug}` as Route
          );
        } else {
          toast.add({ type: 'error', description: message });
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1.5">
        <Heading>Article Settings</Heading>
        <Muted>
          Changing these details will affect how your article appears in search
          engine results and social previews.
        </Muted>
      </div>

      <CoverImageForm
        initialCoverImage={article.coverImage ?? null}
        publicId={article.publicId}
        ref={coverImageRef}
        title={article.title ?? undefined}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="excerpt">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
                  <Textarea
                    className="min-h-32"
                    data-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="What is this article about?"
                    value={field.state.value}
                  />
                  {!!isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field mode="array" name="tags">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                  <Combobox
                    id={field.name}
                    multiple
                    name={field.name}
                    onValueChange={(val) => field.handleChange(val)}
                    value={field.state.value}
                  >
                    <ComboboxChips>
                      <ComboboxValue>
                        {field.state.value.map((value, index) => (
                          <form.Field key={value} name={`tags[${index}]`}>
                            {(subField) => {
                              const isSubFieldInvalid =
                                subField.state.meta.isTouched &&
                                !subField.state.meta.isValid;
                              return (
                                <ComboboxChip
                                  aria-invalid={isSubFieldInvalid}
                                  className="aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                                >
                                  {subField.state.value}
                                </ComboboxChip>
                              );
                            }}
                          </form.Field>
                        ))}
                        <ComboboxChipsInput
                          aria-invalid={isInvalid}
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => setTagInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const val = tagInputValue.trim();
                              if (
                                val !== '' &&
                                !field.state.value.includes(val)
                              ) {
                                field.pushValue(val);
                              }
                              setTagInputValue('');
                            }

                            if (e.key === 'Backspace' && tagInputValue === '') {
                              field.removeValue(field.state.value.length - 1);
                            }
                          }}
                          placeholder="e.g. tutorial, productivity, design"
                          value={tagInputValue}
                        />
                      </ComboboxValue>
                    </ComboboxChips>
                  </Combobox>
                  <FieldDescription>
                    Press <Kbd>Enter</Kbd> or <Kbd>,</Kbd> to add a tag. Helps
                    readers discover your article.
                  </FieldDescription>
                  {!!isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                  <div className="[&>*:not(:first-child)]:hidden">
                    {field.state.value.map((value, index) => (
                      <form.Field
                        key={`tags-error-${value}`}
                        name={`tags[${index}]`}
                      >
                        {(subField) => {
                          const isSubFieldInvalid =
                            subField.state.meta.errors.length > 0;
                          return isSubFieldInvalid ? (
                            <FieldError errors={subField.state.meta.errors} />
                          ) : null;
                        }}
                      </form.Field>
                    ))}
                  </div>
                </Field>
              );
            }}
          </form.Field>

          <Field className="justify-end" orientation="horizontal">
            <Button
              disabled={isPending}
              onClick={() => replace(`/editor/${article.publicId}`)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={QuillWrite01Icon} strokeWidth={2} />
              )}
              Publish
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
