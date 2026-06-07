'use client';

import {
  Archive03Icon,
  Delete01Icon,
  QuillWrite01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ArticleStatusActionsMenuProps {
  onArchive: () => void;
  onDelete: () => void;
  onMoveToDraft: () => void;
  status: ArticleResponse['status'];
}

export function ArticleStatusActionsMenu({
  status,
  onMoveToDraft,
  onArchive,
  onDelete,
}: ArticleStatusActionsMenuProps) {
  return (
    <>
      {status === 'draft' ? null : (
        <DropdownMenuItem onClick={onMoveToDraft}>
          Draft
          <HugeiconsIcon
            className="ml-auto"
            icon={QuillWrite01Icon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
      )}
      {status === 'archived' ? null : (
        <DropdownMenuItem onClick={onArchive}>
          Archive
          <HugeiconsIcon
            className="ml-auto"
            icon={Archive03Icon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
      )}
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
