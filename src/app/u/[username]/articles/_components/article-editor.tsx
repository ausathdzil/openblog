'use client';

import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SaveIcon } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

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
          asChild
          className="pointer-events-none absolute top-4 left-4 animate-pulse"
          disabled
          size="sm"
          variant="ghost"
        >
          <div>
            <SaveIcon />
            Saving…
          </div>
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

function TitleEditor({
  publicId,
  initialTitle,
  onSavingChange,
}: TitleEditorProps) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTitle(initialTitle ?? '');
  }, [initialTitle]);

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
    <textarea
      aria-label="Article title"
      autoCapitalize="on"
      autoComplete="on"
      autoCorrect="on"
      className="mt-0 mb-[0.888889em] block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-extrabold text-(--tw-prose-headings) text-4xl leading-[1.11111] focus:outline-none"
      name="title"
      onInput={(e) => {
        const el = e.currentTarget;
        el.style.height = '0px';
        el.style.height = `${el.scrollHeight}px`;
        const nextTitle = el.value;
        setTitle(nextTitle);
        autosaveTitle(nextTitle);
      }}
      placeholder="Title"
      ref={titleRef}
      rows={1}
      spellCheck="true"
      value={title}
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
    autofocus: true,
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
