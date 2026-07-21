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
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      editor={editor}
      // @ts-expect-error tippyOptions is supported at runtime but missing in types
      tippyOptions={{ placement: 'top-start' }}
    >
      <ToggleGroup size="sm">
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Text"
                onPressedChange={() =>
                  editor.chain().focus().setParagraph().run()
                }
                pressed={editor.isActive('paragraph')}
                value="paragraph"
              >
                <HugeiconsIcon icon={ParagraphIcon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Text</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Heading 1"
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                pressed={editor.isActive('heading', { level: 1 })}
                value="h1"
              >
                <HugeiconsIcon icon={Heading01Icon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Heading 2"
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                pressed={editor.isActive('heading', { level: 2 })}
                value="h2"
              >
                <HugeiconsIcon icon={Heading02Icon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Heading 3"
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                pressed={editor.isActive('heading', { level: 3 })}
                value="h3"
              >
                <HugeiconsIcon icon={Heading03Icon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Bullet List"
                onPressedChange={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
                pressed={editor.isActive('bulletList')}
                value="bulletList"
              >
                <HugeiconsIcon
                  icon={LeftToRightListBulletIcon}
                  size={18}
                  strokeWidth={2}
                />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Ordered List"
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                pressed={editor.isActive('orderedList')}
                value="orderedList"
              >
                <HugeiconsIcon
                  icon={LeftToRightListNumberIcon}
                  size={18}
                  strokeWidth={2}
                />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Ordered List</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Blockquote"
                onPressedChange={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
                pressed={editor.isActive('blockquote')}
                value="blockquote"
              >
                <HugeiconsIcon icon={QuotesIcon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Blockquote</TooltipContent>
        </Tooltip>
      </ToggleGroup>

      <Separator className="mx-1 h-6" orientation="vertical" />

      <ToggleGroup size="sm">
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Bold"
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                pressed={editor.isActive('bold')}
                value="bold"
              >
                <HugeiconsIcon icon={BoldIcon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Italic"
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                pressed={editor.isActive('italic')}
                value="italic"
              >
                <HugeiconsIcon
                  icon={TextItalicIcon}
                  size={18}
                  strokeWidth={2}
                />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Strikethrough"
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                pressed={editor.isActive('strike')}
                value="strike"
              >
                <HugeiconsIcon
                  icon={TextStrikethroughIcon}
                  size={18}
                  strokeWidth={2}
                />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                aria-label="Code"
                onPressedChange={() =>
                  editor.chain().focus().toggleCode().run()
                }
                pressed={editor.isActive('code')}
                value="code"
              >
                <HugeiconsIcon icon={CodeIcon} size={18} strokeWidth={2} />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Code</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </BubbleMenu>
  );
}
