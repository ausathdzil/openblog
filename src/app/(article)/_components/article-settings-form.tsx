'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Heading, Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { TagInput } from '@/components/ui/tag-input';
import { Textarea } from '@/components/ui/textarea';
import { updateArticle } from '@/lib/article-actions';

const excerptSchema = z.object({
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
  tags: z.array(z.string()),
});

export function ArticleSettingsForm({ article }: { article: ArticleResponse }) {
  const { replace, push } = useRouter();
  const [isPending, startTransition] = useTransition();

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
      className="mx-auto max-w-2xl space-y-4"
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
                placeholder="A brief summary of your article..."
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="tags">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
            <TagInput
              onChange={(val) => field.handleChange(val)}
              value={field.state.value}
            />
          </Field>
        )}
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
