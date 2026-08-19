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
import { useEffect } from 'react';

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

  useEffect(() => {
    const scrollPadding =
      inset > 0
        ? `calc(3.5rem + ${inset}px + env(safe-area-inset-bottom))`
        : '';
    document.documentElement.style.scrollPaddingBottom = scrollPadding;

    if (inset > 0 && editor?.isFocused) {
      requestAnimationFrame(() => {
        if (!editor?.isFocused) {
          return;
        }
        try {
          editor.commands.scrollIntoView();
        } catch {
          // no-op
        }
        try {
          const { from } = editor.state.selection;
          const { node } = editor.view.domAtPos(from);
          const el = node as unknown as HTMLElement;
          const block =
            (el.closest?.('[data-node-type]') as HTMLElement | null) ??
            (el.closest?.(
              'p, h1, h2, h3, blockquote, li, pre'
            ) as HTMLElement | null) ??
            el;
          block?.scrollIntoView({ block: 'center', inline: 'nearest' });
        } catch {
          // no-op
        }
      });
    }

    return () => {
      document.documentElement.style.scrollPaddingBottom = '';
    };
  }, [inset, editor]);

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
