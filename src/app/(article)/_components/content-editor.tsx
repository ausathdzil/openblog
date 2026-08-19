'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TableOfContents } from '@tiptap/extension-table-of-contents';
import { Placeholder } from '@tiptap/extensions';
import {
  EditorContent,
  type JSONContent,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
import { CodeBlock } from './code-block';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorMobileToolbar } from './editor-mobile-toolbar';
import { lowlight } from './lowlight';
import type { TocAnchor } from './table-of-contents';

interface ContentEditorProps {
  onBlur: () => void;
  onChange: (value: JSONContent) => void;
  onTocUpdate?: (anchors: TocAnchor[]) => void;
  value: JSONContent;
}

export function ContentEditor({
  value,
  onBlur,
  onChange,
  onTocUpdate,
}: ContentEditorProps) {
  const inset = useKeyboardInset();

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
      TableOfContents.configure({
        scrollParent: () => window,
        onUpdate: (anchors) => {
          const filtered = (anchors as TocAnchor[]).filter(
            (a) => a.originalLevel >= 1 && a.originalLevel <= 3
          );
          onTocUpdate?.(filtered);
        },
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
    onUpdate: ({ editor: _editor }) => {
      const json = _editor.getJSON();
      onChange(json);
    },
    immediatelyRender: false,
  });

  return (
    <>
      {!!editor && <EditorBubbleMenu editor={editor} />}
      {!!editor && <EditorMobileToolbar editor={editor} />}
      <div
        className="pb-14 md:pb-0"
        style={
          inset > 0
            ? {
                paddingBottom: `calc(3.5rem + ${inset}px + env(safe-area-inset-bottom))`,
              }
            : undefined
        }
      >
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
