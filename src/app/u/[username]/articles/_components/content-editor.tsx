'use client';

import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

export function ContentEditor({
  initialTitle,
  initialContent,
}: {
  initialTitle: string;
  initialContent: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [serializedContent, setSerializedContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown,
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
    content: serializedContent,
    contentType: 'markdown',
    onUpdate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown());
    },
    onCreate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown());
    },
    immediatelyRender: false,
  });

  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto size-full py-16">
      <input
        autoCapitalize="on"
        autoCorrect="on"
        className="w-full scroll-m-20 text-balance font-medium text-4xl tracking-tight focus:outline-none"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        spellCheck="true"
        type="text"
        value={title}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
