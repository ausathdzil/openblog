'use client';

import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import type { JSONContent } from '@tiptap/react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Header } from '@/components/header';
import { HeaderTitle } from '@/components/header-title';
import { OpenBlogButton } from '@/components/openblog-button';
import { Button } from '@/components/ui/button';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { updateArticle } from '@/lib/article-actions';
import { BeforeUnloadGuard } from './before-unload-guard';
import { ContentEditor } from './content-editor';
import { EditorActions } from './editor-actions';
import { PublishButton } from './publish-button';
import { ResizableTextarea } from './resizable-textarea';
import { SaveButton } from './save-button';

const articleSchema = z.object({
  title: z
    .string()
    .check(
      z.trim(),
      z.maxLength(255, 'Title must be 255 characters or fewer.')
    ),
  contentJson: z.any(),
  status: z.literal(
    ['draft', 'published', 'archived'],
    'Status must be either draft, published, or archived.'
  ),
});

interface HeaderFormSelection {
  contentJson: JSONContent;
  isValid: boolean;
  status: 'archived' | 'draft' | 'published';
  title: string;
}

export function ArticleEditor({ article }: { article: ArticleResponse }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      title: article.title ?? '',
      contentJson: article.contentJson ?? {},
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
          contentJson: structuredClone(value.contentJson),
        });

        if (res?.error) {
          toast.error(res.error.message, { position: 'top-center' });
        } else {
          form.reset(value);
        }
      });
    },
  });

  return (
    <>
      <form.Subscribe<boolean> selector={(state) => state.isDirty}>
        {(isDirty) => <BeforeUnloadGuard isDirty={isDirty} />}
      </form.Subscribe>
      <Header>
        <Header.Nav>
          <OpenBlogButton />
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/explore" />}
            size="sm"
            variant="ghost"
          >
            Explore
          </Button>
        </Header.Nav>
        <HeaderTitle>{article.title || 'Untitled Draft'}</HeaderTitle>
        <Header.Actions>
          <form.Subscribe<HeaderFormSelection>
            selector={(state) => ({
              isValid: state.isValid,
              title: state.values.title,
              contentJson: state.values.contentJson as JSONContent,
              status: state.values.status,
            })}
          >
            {(formState) => (
              <div className="flex items-center gap-2">
                <EditorActions article={article} />
                {formState.status === 'published' ? (
                  <SaveButton
                    article={article}
                    className="h-11 sm:h-8"
                    contentJson={formState.contentJson}
                    isValid={formState.isValid}
                    onSaved={() => {
                      form.reset({
                        ...form.state.values,
                        status: 'published',
                      });
                      router.push(
                        `/@${article.author?.username}/articles/${article.slug}` as Route
                      );
                    }}
                    title={formState.title}
                  />
                ) : (
                  <PublishButton
                    className="h-11 sm:h-8"
                    contentJson={formState.contentJson}
                    isContentEmpty={isContentEmpty(formState.contentJson)}
                    isTitleEmpty={formState.title.trim().length === 0}
                    isValid={formState.isValid}
                    onPublished={() => {
                      form.reset({
                        ...form.state.values,
                        status: 'published',
                      });
                      router.push(
                        `/@${article.author?.username}/articles/${article.slug}` as Route
                      );
                    }}
                    publicId={article.publicId}
                    status={formState.status}
                    title={formState.title}
                  />
                )}
              </div>
            )}
          </form.Subscribe>
        </Header.Actions>
      </Header>
      <main className="prose prose-neutral dark:prose-invert mx-auto size-full p-6 sm:p-4">
        <div className="pointer-events-none fixed right-6 bottom-6 z-20 hidden gap-2 sm:block">
          {isPending ? (
            <Marker role="status">
              <MarkerIcon>
                <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
              </MarkerIcon>
              <MarkerContent>Saving…</MarkerContent>
            </Marker>
          ) : (
            <Marker>
              <MarkerContent>
                Last saved{' '}
                {article.updatedAt.toLocaleString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false,
                })}
              </MarkerContent>
            </Marker>
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
                  className="font-extrabold text-(--tw-prose-headings) text-4xl leading-[1.11111]"
                  errors={field.state.meta.errors}
                  isInvalid={isInvalid}
                  maxLength={255}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  onKeyDown={handleTitleEnter}
                  placeholder="Title"
                  spellCheck
                  value={field.state.value}
                />
              );
            }}
          </form.Field>
          <form.Field name="contentJson">
            {(field) => (
              <ContentEditor
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value as JSONContent}
              />
            )}
          </form.Field>
        </form>
      </main>
    </>
  );
}

function isContentEmpty(contentJson: JSONContent | undefined): boolean {
  if (!contentJson) {
    return true;
  }
  if (
    contentJson.type === 'doc' &&
    contentJson.content &&
    contentJson.content.length === 1
  ) {
    const first = contentJson.content[0];
    if (first && first.type === 'paragraph' && !first.content) {
      return true;
    }
  }
  if (contentJson.content && contentJson.content.length === 0) {
    return true;
  }
  return false;
}

function handleTitleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter') {
    e.preventDefault();
    setTimeout(() => {
      const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
      editorEl?.focus();
    }, 0);
  }
}
