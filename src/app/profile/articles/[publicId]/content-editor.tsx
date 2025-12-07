'use client';

import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

export function ContentEditor({ initialContent }: { initialContent: string }) {
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
        class:
          'prose prose-neutral dark:prose-invert mx-auto size-full px-4 py-16 focus:outline-none',
      },
    },
    autofocus: 'end',
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

  return <EditorContent editor={editor} />;
}
