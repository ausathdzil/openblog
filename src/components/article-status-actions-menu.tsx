'use client';

import {
  Archive03Icon,
  Delete01Icon,
  QuillWrite01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { ArticleModel } from '@/app/elysia/modules/article/model';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ArticleStatusActionsMenuProps {
  status: ArticleModel.ArticleResponse['status'];
  onMoveToDraft: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ArticleStatusActionsMenu({
  status,
  onMoveToDraft,
  onArchive,
  onDelete,
}: ArticleStatusActionsMenuProps) {
  return (
    <>
      {status !== 'draft' ? (
        <DropdownMenuItem onClick={onMoveToDraft}>
          Move to draft
          <HugeiconsIcon
            className="ml-4"
            icon={QuillWrite01Icon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
      ) : null}
      {status !== 'archived' ? (
        <DropdownMenuItem onClick={onArchive}>
          Archive
          <HugeiconsIcon
            className="ml-auto"
            icon={Archive03Icon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        Delete
        <HugeiconsIcon
          className="ml-auto"
          icon={Delete01Icon}
          strokeWidth={2}
        />
      </DropdownMenuItem>
    </>
  );
}
