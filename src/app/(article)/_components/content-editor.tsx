'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extensions';
import {
  EditorContent,
  type JSONContent,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { createLowlight } from 'lowlight';

import { CodeBlock } from './code-block';

const lowlight = createLowlight();
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('json', json);

interface ContentEditorProps {
  onBlur: () => void;
  onChange: (value: JSONContent) => void;
  value: JSONContent;
}

export function ContentEditor({ value, onBlur, onChange }: ContentEditorProps) {
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
    content: value,
    editorProps: {
      attributes: {
        'aria-label': 'content',
        class: 'focus:outline-none',
      },
    },
    onBlur,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
}
