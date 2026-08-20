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
import { BubbleMenu } from '@tiptap/react/menus';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorBubbleMenuProps {
  editor: Editor;
}

function BubbleTooltip({
  bubbleVisible,
  children,
  label,
}: {
  bubbleVisible: boolean;
  children: React.ReactElement;
  label: string;
}) {
  return (
    <Tooltip key={`${label}-${bubbleVisible ? 'visible' : 'hidden'}`}>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const {
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

  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const bubbleOptions = {
    placement: 'top-start' as const,
    onShow: () => setIsBubbleVisible(true),
    onHide: () => setIsBubbleVisible(false),
  };

  return (
    <BubbleMenu
      className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      editor={editor}
      options={bubbleOptions}
      shouldShow={({ from, to }) => from !== to}
    >
      <div className="flex items-center gap-1">
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Text">
          <Button
            aria-label="Text"
            onClick={() => editor.chain().focus().setParagraph().run()}
            size="icon-sm"
            variant={isParagraph ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={ParagraphIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Heading 1">
          <Button
            aria-label="Heading 1"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            size="icon-sm"
            variant={isHeading1 ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={Heading01Icon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Heading 2">
          <Button
            aria-label="Heading 2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            size="icon-sm"
            variant={isHeading2 ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={Heading02Icon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Heading 3">
          <Button
            aria-label="Heading 3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            size="icon-sm"
            variant={isHeading3 ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={Heading03Icon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Bullet List">
          <Button
            aria-label="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            size="icon-sm"
            variant={isBulletList ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={LeftToRightListBulletIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Ordered List">
          <Button
            aria-label="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            size="icon-sm"
            variant={isOrderedList ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={LeftToRightListNumberIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Blockquote">
          <Button
            aria-label="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            size="icon-sm"
            variant={isBlockquote ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={QuotesIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
      </div>

      <Separator orientation="vertical" />

      <div className="flex items-center gap-1">
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Bold">
          <Button
            aria-label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="icon-sm"
            variant={isBold ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={BoldIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Italic">
          <Button
            aria-label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="icon-sm"
            variant={isItalic ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Strikethrough">
          <Button
            aria-label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            size="icon-sm"
            variant={isStrike ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={TextStrikethroughIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
        <BubbleTooltip bubbleVisible={isBubbleVisible} label="Code">
          <Button
            aria-label="Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            size="icon-sm"
            variant={isCode ? 'secondary' : 'ghost'}
          >
            <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
          </Button>
        </BubbleTooltip>
      </div>
    </BubbleMenu>
  );
}
