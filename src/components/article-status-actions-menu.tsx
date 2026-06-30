'use client';

import {
  Archive03Icon,
  Delete01Icon,
  QuillWrite01Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ArticleStatusActionsMenuProps {
  onArchive: () => void;
  onDelete: () => void;
  onMoveToDraft: () => void;
  publicId: string;
  status: ArticleResponse['status'];
}

export function ArticleStatusActionsMenu({
  publicId,
  status,
  onMoveToDraft,
  onArchive,
  onDelete,
}: ArticleStatusActionsMenuProps) {
  return (
    <>
      <DropdownMenuItem
        render={<Link href={`/preview/${publicId}`} />}
      >
        Preview
        <HugeiconsIcon className="ml-auto" icon={ViewIcon} strokeWidth={2} />
      </DropdownMenuItem>
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
