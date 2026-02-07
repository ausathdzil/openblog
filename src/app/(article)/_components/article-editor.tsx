'use client';

import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from '@tanstack/react-form';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { format } from 'date-fns';
import { common, createLowlight } from 'lowlight';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod/mini';

import type { ArticleModel } from '@/app/elysia/modules/article/model';
import { Button, buttonVariants } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { updateArticle } from '../_lib/actions';
import { CodeBlock } from './code-block';
import { Header } from './header';

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

function BeforeUnloadGuard({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handle);
    return () => {
      window.removeEventListener('beforeunload', handle);
    };
  }, [isDirty]);
  return null;
}

export function ArticleEditor({
  article,
}: {
  article: ArticleModel.ArticleResponse;
}) {
  const router = useRouter();
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
      // biome-ignore lint/suspicious/noAlert: native confirm for unsaved-changes (AGENTS.md)
      const leave = window.confirm('You have unsaved changes. Leave anyway?');
      if (!leave) {
        return;
      }
    }
    router.back();
  };

  return (
    <>
      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) => <BeforeUnloadGuard isDirty={isDirty} />}
      </form.Subscribe>
      <Header
        onBackClick={handleBack}
        title={article.title || 'Untitled Draft'}
      >
        <form.Subscribe
          selector={(state) => ({
            isValid: state.isValid,
            title: state.values.title,
            content: state.values.content,
            status: state.values.status,
          })}
        >
          {(formState) => (
            <>
              <PublishButton
                isContentEmpty={formState.content.trim().length === 0}
                isTitleEmpty={formState.title.trim().length === 0}
                isValid={formState.isValid}
                publicId={article.publicId}
                status={formState.status}
              />
              {formState.status === 'published' && (
                <Button
                  disabled={isPending}
                  form="article-editor-form"
                  size="pill-sm"
                  type="submit"
                >
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              )}
            </>
          )}
        </form.Subscribe>
      </Header>
      <main className="prose prose-neutral dark:prose-invert mx-auto size-full p-8">
        <div
          className={cn(
            buttonVariants({ size: 'lg', variant: 'ghost' }),
            'pointer-events-none fixed right-4 bottom-4 z-20 opacity-50',
            isPending && 'animate-pulse'
          )}
        >
          {isPending ? (
            <>
              <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
              Saving…
            </>
          ) : (
            `Last saved on ${format(article.updatedAt, 'MMM d, yyyy h:mm a')}`
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
            children={(field) => {
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
                  placeholder="Title"
                  spellCheck="true"
                  value={field.state.value}
                />
              );
            }}
            name="title"
            validators={{
              onChange: articleSchema.shape.title,
            }}
          />
          <form.Field
            children={(field) => {
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
                  placeholder="Excerpt"
                  spellCheck="true"
                  value={field.state.value}
                />
              );
            }}
            name="excerpt"
            validators={{
              onChange: articleSchema.shape.excerpt,
            }}
          />
          <form.Field
            children={(field) => (
              <ContentEditor
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
              />
            )}
            name="content"
          />
        </form>
      </main>
    </>
  );
}

type PublishButtonProps = {
  isValid: boolean;
  isTitleEmpty: boolean;
  isContentEmpty: boolean;
  status: string | null;
  publicId: string;
} & React.ComponentProps<typeof Button>;

function PublishButton({
  isValid,
  isTitleEmpty,
  isContentEmpty,
  status,
  publicId,
  ...props
}: PublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(false);

  if (status !== 'draft') {
    return null;
  }

  const handlePublish = () => {
    if (!isValid) {
      toast.error('Please fix all errors before publishing', {
        position: 'top-center',
      });
      return;
    }

    if (isTitleEmpty) {
      toast.error('Please enter a title before publishing', {
        position: 'top-center',
      });
      return;
    }

    if (isContentEmpty) {
      toast.error('Please enter some content before publishing', {
        position: 'top-center',
      });
      return;
    }

    startTransition(async () => {
      const res = await updateArticle(publicId, {
        status: 'published',
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
      }

      setIsPublished(true);
    });
  };

  return (
    <Button
      disabled={isPending || isPublished}
      onClick={handlePublish}
      size="pill-sm"
      {...props}
    >
      {isPublished ? 'Published' : 'Publish'}
    </Button>
  );
}

type ResizableTextareaProps = {
  errors: Array<{ message?: string } | undefined>;
  isInvalid: boolean;
  onChange: (value: string) => void;
  value: string;
} & Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'>;

function ResizableTextarea({
  errors,
  isInvalid,
  onChange,
  value,
  className,
  ...props
}: ResizableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }

    el.value = value;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.currentTarget.value);
    const el = e.currentTarget;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="mb-[0.888889em]">
      <textarea
        className={cn(
          'w-full resize-none overflow-hidden focus:outline-none',
          className
        )}
        onChange={handleChange}
        ref={textareaRef}
        rows={1}
        value={value}
        {...props}
      />
      {isInvalid && <FieldError errors={errors} />}
    </div>
  );
}

const lowlight = createLowlight(common);

interface ContentEditorProps {
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}

function ContentEditor({ value, onBlur, onChange }: ContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlock);
        },
      }).configure({
        enableTabIndentation: true,
        lowlight,
        tabSize: 2,
      }),
      Markdown.configure({
        markedOptions: {
          gfm: true,
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }

          if (node.type.name === 'blockquote') {
            return 'Quote';
          }

          if (
            node.type.name === 'bulletList' ||
            node.type.name === 'orderedList'
          ) {
            return 'List';
          }

          return 'Start writing…';
        },
      }),
    ],
    autofocus: 'end',
    content: value,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        'aria-label': 'content',
        class: 'focus:outline-none',
      },
    },
    onBlur,
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();
      onChange(markdown);
    },
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
}
