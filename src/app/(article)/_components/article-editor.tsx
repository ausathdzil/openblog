'use client';

import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { updateArticle } from '../_lib/actions';
import { BeforeUnloadGuard } from './before-unload-guard';
import { ContentEditor } from './content-editor';
import { EditorActions } from './editor-actions';
import { Header } from './header';
import { PublishButton } from './publish-button';
import { ResizableTextarea } from './resizable-textarea';

const articleSchema = z.object({
  title: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Title must be 255 characters or fewer.')
    ),
  content: z.string().check(z.trim()),
  excerpt: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Excerpt must be 255 characters or fewer.')
    ),
  status: z.literal(
    ['draft', 'published', 'archived'],
    'Status must be either draft, published, or archived.'
  ),
});

function isContentEmpty(content: string): boolean {
  const normalized = content
    .replace(/\u00A0/g, '') // Remove the non-breaking space character
    .replace(/&nbsp;/gi, '') // Remove the literal "&nbsp;" string
    .trim();
  return normalized.length === 0;
}

interface HeaderFormSelection {
  content: string;
  isValid: boolean;
  status: 'archived' | 'draft' | 'published';
  title: string;
}

export function ArticleEditor({ article }: { article: ArticleResponse }) {
  const { back } = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      title: article.title ?? '',
      content: article.content ?? '',
      excerpt: article.excerpt ?? '',
      status: article.status,
    },
    validators: {
      onSubmit: articleSchema,
    },
    listeners: {
      onChangeDebounceMs: 1000,
      onChange: ({ formApi }) => {
        if (
          formApi.state.isValid &&
          formApi.state.values.status !== 'published'
        ) {
          formApi.handleSubmit();
        }
      },
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const res = await updateArticle(article.publicId, {
          title: value.title,
          content: value.content,
          excerpt: value.excerpt,
        });

        if (res?.error) {
          toast.error(res.error.message, { position: 'top-center' });
        } else {
          form.reset(value);
        }
      });
    },
  });

  const handleBack = () => {
    if (form.state.isDirty) {
      // biome-ignore lint/suspicious/noAlert: native confirm for unsaved-changes
      const leave = window.confirm('You have unsaved changes. Leave anyway?');
      if (!leave) {
        return;
      }
      form.reset();
    }
    back();
  };

  const handlePreventEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <form.Subscribe<boolean> selector={(state) => state.isDirty}>
        {(isDirty) => <BeforeUnloadGuard isDirty={isDirty} />}
      </form.Subscribe>
      <Header
        onBackClick={handleBack}
        title={article.title || 'Untitled Draft'}
      >
        <form.Subscribe<HeaderFormSelection>
          selector={(state) => ({
            isValid: state.isValid,
            title: state.values.title,
            content: state.values.content,
            status: state.values.status,
          })}
        >
          {(formState) => (
            <div className="flex items-center gap-2">
              <EditorActions article={article} />
              {formState.status === 'published' ? (
                <Button
                  className="h-11 sm:h-8"
                  disabled={isPending}
                  form="article-editor-form"
                  size="pill-sm"
                  type="submit"
                >
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              ) : (
                <PublishButton
                  className="h-11 sm:h-8"
                  isContentEmpty={isContentEmpty(formState.content)}
                  isTitleEmpty={formState.title.trim().length === 0}
                  isValid={formState.isValid}
                  onPublished={() => {
                    form.reset({
                      ...form.state.values,
                      status: 'published',
                    });
                  }}
                  publicId={article.publicId}
                  status={formState.status}
                />
              )}
            </div>
          )}
        </form.Subscribe>
      </Header>
      <main className="prose prose-neutral dark:prose-invert mx-auto size-full p-6 sm:p-4">
        <div
          className={cn(
            buttonVariants({ size: 'lg', variant: 'ghost' }),
            'pointer-events-none fixed right-4 bottom-4 z-20 hidden opacity-50 sm:inline-flex',
            isPending && 'animate-pulse'
          )}
        >
          {isPending ? (
            <>
              <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
              Saving…
            </>
          ) : (
            `Last saved on ${article.updatedAt.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
            `
          )}
        </div>
        <form
          id="article-editor-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="title"
            validators={{
              onChange: articleSchema.shape.title,
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <ResizableTextarea
                  aria-label={field.name}
                  autoCapitalize="words"
                  autoCorrect="on"
                  autoFocus
                  className="font-extrabold text-(--tw-prose-headings) text-4xl leading-[1.11111]"
                  errors={field.state.meta.errors}
                  isInvalid={isInvalid}
                  maxLength={255}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  onKeyDown={handlePreventEnter}
                  placeholder="Title"
                  spellCheck
                  value={field.state.value}
                />
              );
            }}
          </form.Field>
          <form.Field
            name="excerpt"
            validators={{
              onChange: articleSchema.shape.excerpt,
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <ResizableTextarea
                  aria-label={field.name}
                  autoCapitalize="on"
                  autoCorrect="on"
                  className="font-semibold text-2xl"
                  errors={field.state.meta.errors}
                  isInvalid={isInvalid}
                  maxLength={255}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  onKeyDown={handlePreventEnter}
                  placeholder="Excerpt"
                  spellCheck
                  value={field.state.value}
                />
              );
            }}
          </form.Field>
          <form.Field name="content">
            {(field) => (
              <ContentEditor
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
              />
            )}
          </form.Field>
        </form>
      </main>
    </>
  );
}
