/** biome-ignore-all lint/suspicious/noArrayIndexKey lint/performance/noImgElement lint/a11y/noRedundantAlt lint/correctness/useImageSize: TanStack Form array mode + cover preview uses blob URL per plan */
'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { updateArticle, uploadCoverImage } from '@/lib/article-actions';
import { cn } from '@/lib/utils';

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

const COVER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
const MAX_COVER_SIZE = 3 * 1024 * 1024;

const coverFileSchema = z.object({
  file: z
    .file('Please select a file.')
    .check(
      z.minSize(1),
      z.maxSize(MAX_COVER_SIZE, 'Cover image must be less than 3MB.'),
      z.mime(
        COVER_TYPES,
        'Cover image must be a JPEG, PNG, WebP, GIF, or AVIF.'
      )
    ),
});

export function ArticleSettingsForm({ article }: { article: ArticleResponse }) {
  const { replace, push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCoverPending, startCoverTransition] = useTransition();
  const [tagInputValue, setTagInputValue] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(
    article.coverImage ?? null
  );
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverStatus, setCoverStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [coverFieldError, setCoverFieldError] = useState<string | null>(null);

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

  const handleCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setCoverStatus(null);
    setCoverFieldError(null);
    if (!selected) {
      setSelectedCoverFile(null);
      return;
    }
    const parsed = coverFileSchema.safeParse({ file: selected });
    if (!parsed.success) {
      const [issue] = parsed.error.issues;
      setCoverFieldError(issue?.message ?? 'Invalid file.');
      setSelectedCoverFile(null);
      return;
    }
    setSelectedCoverFile(selected);
    if (coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverPreview(URL.createObjectURL(selected));
  };

  const handleCoverUpload = () => {
    if (!selectedCoverFile) {
      setCoverFieldError('Please select a file.');
      return;
    }
    setCoverStatus(null);
    setCoverFieldError(null);
    startCoverTransition(async () => {
      const result = await uploadCoverImage(
        article.publicId,
        selectedCoverFile
      );
      if (result.status === 200 && result.url) {
        setCoverPreview(result.url);
        setSelectedCoverFile(null);
        setCoverStatus({
          type: 'success',
          message: result.message || 'Cover image updated.',
        });
        toast.add({ type: 'success', description: result.message });
        refresh();
      } else {
        setCoverStatus({
          type: 'error',
          message: result.message || 'Failed to upload cover image.',
        });
        toast.add({ type: 'error', description: result.message });
      }
    });
  };

  const handleCoverRemove = () => {
    setCoverStatus(null);
    setCoverFieldError(null);
    startCoverTransition(async () => {
      const { status, message } = await updateArticle(article.publicId, {
        coverImage: null,
      });
      if (status === 200) {
        if (coverPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreview);
        }
        setCoverPreview(null);
        setSelectedCoverFile(null);
        setCoverStatus({ type: 'success', message: 'Cover image removed.' });
        toast.add({ type: 'success', description: 'Cover image removed.' });
        refresh();
      } else {
        setCoverStatus({ type: 'error', message });
        toast.add({ type: 'error', description: message });
      }
    });
  };

  return (
    <form
      className="mx-auto max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
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

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="cover-image">Cover image</FieldLabel>
          {coverPreview ? (
            <img
              alt="Cover image preview"
              className="max-h-64 w-full rounded-md border object-cover"
              src={coverPreview}
            />
          ) : null}
          <Input
            accept={COVER_TYPES.join(',')}
            aria-invalid={!!coverFieldError}
            disabled={isCoverPending}
            id="cover-image"
            name="cover-image"
            onChange={handleCoverFileChange}
            type="file"
          />
          <FieldDescription>
            JPEG, PNG, WebP, GIF, or AVIF, no larger than 3MB.
          </FieldDescription>
          {coverFieldError ? (
            <FieldError errors={[{ message: coverFieldError }]} />
          ) : null}
          <div className="flex gap-2">
            <Button
              disabled={isCoverPending || !selectedCoverFile}
              onClick={handleCoverUpload}
              type="button"
              variant="outline"
            >
              {isCoverPending ? <Spinner /> : null}
              Upload
            </Button>
            {coverPreview ? (
              <Button
                disabled={isCoverPending}
                onClick={handleCoverRemove}
                type="button"
                variant="ghost"
              >
                Remove
              </Button>
            ) : null}
          </div>
          <Muted
            className={cn(
              coverStatus ? 'visible' : 'invisible',
              coverStatus?.type === 'error'
                ? 'text-destructive'
                : 'text-emerald-600 dark:text-emerald-500'
            )}
          >
            {coverStatus?.message || ' '}
          </Muted>
        </Field>

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
                {!!isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                {!!isInvalid && <FieldError errors={field.state.meta.errors} />}
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
  );
}
