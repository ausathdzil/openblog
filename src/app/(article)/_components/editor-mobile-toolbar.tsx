'use client';

import {
  BoldIcon,
  CodeIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  ParagraphIcon,
  QuotesIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type Editor, useEditorState } from '@tiptap/react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
import { useMediaQuery } from '@/hooks/use-media-query';

interface EditorMobileToolbarProps {
  editor: Editor;
}

export function EditorMobileToolbar({ editor }: EditorMobileToolbarProps) {
  const isCoarse = useMediaQuery('(pointer: coarse)');
  const inset = useKeyboardInset();

  const {
    isFocused,
    isParagraph,
    isHeading1,
    isHeading2,
    isHeading3,
    isBulletList,
    isOrderedList,
    isBlockquote,
    isBold,
    isItalic,
    isStrike,
    isCode,
  } = useEditorState({
    editor,
    selector: (ctx) => ({
      isFocused: ctx.editor.isFocused,
      isParagraph: ctx.editor.isActive('paragraph'),
      isHeading1: ctx.editor.isActive('heading', { level: 1 }),
      isHeading2: ctx.editor.isActive('heading', { level: 2 }),
      isHeading3: ctx.editor.isActive('heading', { level: 3 }),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
      isCode: ctx.editor.isActive('code'),
    }),
  });

  if (!(isCoarse && isFocused)) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col border-neutral-200 border-t bg-white pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden dark:border-neutral-800 dark:bg-neutral-900"
      style={{ transform: `translateY(-${inset}px)` }}
    >
      <div
        aria-label="Formatting toolbar"
        className="scrollbar-thin flex items-center gap-1 overflow-x-auto overscroll-x-contain px-2 py-2 [-webkit-overflow-scrolling:touch] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5"
        role="toolbar"
      >
        <Button
          aria-label="Text"
          onClick={() => editor.chain().focus().setParagraph().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isParagraph ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={ParagraphIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isHeading1 ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={Heading01Icon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isHeading2 ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={Heading02Icon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isHeading3 ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={Heading03Icon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isBulletList ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={LeftToRightListBulletIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isOrderedList ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={LeftToRightListNumberIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isBlockquote ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={QuotesIcon} strokeWidth={2} />
        </Button>

        <Separator orientation="vertical" />

        <Button
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isBold ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={BoldIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isItalic ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isStrike ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={TextStrikethroughIcon} strokeWidth={2} />
        </Button>
        <Button
          aria-label="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          onMouseDown={(e) => e.preventDefault()}
          size="icon"
          variant={isCode ? 'secondary' : 'ghost'}
        >
          <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
