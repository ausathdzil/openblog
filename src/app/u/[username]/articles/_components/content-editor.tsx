'use client';

import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { updateArticle } from '../_lib/actions';

type ContentEditorProps = {
  publicId: string;
  currentTitle: string;
  currentContent: string;
};

export function ContentEditor({
  publicId,
  currentTitle,
  currentContent,
}: ContentEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(currentTitle);
  const [content, setContent] = useState(currentContent);

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingPayloadRef = useRef<{ title?: string; content?: string }>({});

  useEffect(() => {
    const el = titleRef.current;
    if (!el) {
      return;
    }
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const flushPending = useDebouncedCallback(() => {
    const payload = pendingPayloadRef.current;
    pendingPayloadRef.current = {};

    if (Object.keys(payload).length === 0) {
      return;
    }

    startTransition(async () => {
      const res = await updateArticle(publicId, payload);

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
        class: 'focus:outline-none',
      },
    },
    content,
    contentType: 'markdown',
    onUpdate: ({ editor }) => {
      const content = editor.getMarkdown();
      setContent(content);
      pendingPayloadRef.current = { ...pendingPayloadRef.current, content };
      flushPending();
    },
    immediatelyRender: false,
  });

  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto size-full px-4 py-16">
      {isPending && (
        <div className="absolute top-4 left-4">
          <Button className="opacity-50" disabled size="sm" variant="ghost">
            <Spinner />
            Saving…
          </Button>
        </div>
      )}
      <textarea
        autoCapitalize="on"
        autoCorrect="on"
        className="mt-0 mb-[0.888889em] block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-extrabold text-(--tw-prose-headings) text-4xl leading-[1.11111] focus:outline-none"
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = '0px';
          el.style.height = `${el.scrollHeight}px`;
          const value = el.value;
          setTitle(value);
          pendingPayloadRef.current = {
            ...pendingPayloadRef.current,
            title: value,
          };
          flushPending();
        }}
        placeholder="Title"
        ref={titleRef}
        rows={1}
        spellCheck="true"
        value={title}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
