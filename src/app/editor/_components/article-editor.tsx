'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import * as z from 'zod/mini';

import { Button } from '@/components/ui/button';
import { updateArticle } from '../_lib/actions';

type ArticleEditorProps = {
  publicId: string;
  currentTitle: string | null | undefined;
  currentContent: string | null | undefined;
};

export function ArticleEditor({
  publicId,
  currentTitle,
  currentContent,
}: ArticleEditorProps) {
  const [titleSaving, setTitleSaving] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);

  const isSaving = titleSaving || contentSaving;

  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto size-full px-4 py-16">
      {isSaving && (
        <Button
          className="pointer-events-none absolute right-4 bottom-4 animate-pulse"
          disabled
          nativeButton={false}
          render={<div />}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
          Saving…
        </Button>
      )}
      <TitleEditor
        initialTitle={currentTitle}
        onSavingChange={setTitleSaving}
        publicId={publicId}
      />
      <ContentEditor
        initialContent={currentContent}
        onSavingChange={setContentSaving}
        publicId={publicId}
      />
    </div>
  );
}

type TitleEditorProps = {
  publicId: string;
  initialTitle: string | null | undefined;
  onSavingChange?: (isSaving: boolean) => void;
};

const titleSchema = z.object({
  title: z
    .string()
    .check(
      z.maxLength(255, 'Title must be 255 characters or fewer.'),
      z.trim(),
    ),
});

type TitleFieldValues = z.infer<typeof titleSchema>;

function TitleEditor({
  publicId,
  initialTitle,
  onSavingChange,
}: TitleEditorProps) {
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<TitleFieldValues>({
    resolver: zodResolver(titleSchema),
    defaultValues: {
      title: initialTitle ?? '',
    },
    mode: 'onChange',
  });

  const title = form.watch('title');

  useEffect(() => {
    onSavingChange?.(isPending);
  }, [isPending, onSavingChange]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) {
      return;
    }

    el.value = title;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  const autosaveTitle = useDebouncedCallback((title: string) => {
    startTransition(async () => {
      const res = await updateArticle(publicId, { title });
      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
      }
    });
  }, 1000);

  return (
    <Controller
      control={form.control}
      name="title"
      render={({ field, fieldState }) => (
        <div className="mb-[0.888889em]">
          <textarea
            {...field}
            aria-invalid={fieldState.invalid}
            aria-label="Title"
            autoCapitalize="on"
            autoComplete="on"
            autoCorrect="on"
            className="w-full resize-none overflow-hidden font-display text-(--tw-prose-headings) text-4xl leading-[1.11111] focus:outline-none"
            maxLength={255}
            name="Title"
            onChange={(e) => {
              const el = e.currentTarget;
              el.style.height = '0px';
              el.style.height = `${el.scrollHeight}px`;
              field.onChange(e.target.value);
              if (!fieldState.invalid) {
                autosaveTitle(e.target.value);
              }
            }}
            placeholder="Title"
            ref={titleRef}
            required
            rows={1}
            spellCheck="true"
          />
          {fieldState.invalid && (
            <p className="text-destructive text-sm">
              {fieldState.error?.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

type ContentEditorProps = {
  publicId: string;
  initialContent: string | null | undefined;
  onSavingChange?: (isSaving: boolean) => void;
};

function ContentEditor({
  publicId,
  initialContent,
  onSavingChange,
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent ?? '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onSavingChange?.(isPending);
  }, [isPending, onSavingChange]);

  const autosaveContent = useDebouncedCallback((content: string) => {
    startTransition(async () => {
      const res = await updateArticle(publicId, { content });
      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
      }
    });
  }, 1000);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
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
    editorProps: {
      attributes: {
        'aria-label': 'Article content',
        class: 'focus:outline-none',
      },
    },
    autofocus: 'end',
    content,
    contentType: 'markdown',
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();
      setContent(markdown);
      autosaveContent(markdown);
    },
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
}
