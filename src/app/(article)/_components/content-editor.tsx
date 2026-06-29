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

import { CodeBlock } from './code-block';
import { lowlight } from './lowlight';

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
        tabSize: 4,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
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
