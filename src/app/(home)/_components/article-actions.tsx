'use client';

import {
  Edit01Icon,
  MoreHorizontalIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState, useTransition } from 'react';

import type { ArticleListResponse } from '@/app/elysia/modules/article/model';
import { ArchiveArticleDialog } from '@/components/archive-article-dialog';
import { ArticleStatusActionsMenu } from '@/components/article-status-actions-menu';
import { DeleteArticleDialog } from '@/components/delete-article-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemActions } from '@/components/ui/item';
import { toast } from '@/components/ui/toast';
import {
  archiveArticle,
  deleteArticle,
  moveArticleToDraft,
} from '@/lib/article-actions';

export function ArticleActions({ article }: { article: ArticleListResponse }) {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const { status, message } = await archiveArticle(
        article.publicId,
        article.author?.username ?? ''
      );

      if (status === 200) {
        toast.add({ type: 'info', description: message });
        setArchiveDialogOpen(false);
      } else {
        toast.add({ type: 'error', description: message });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const { status, message } = await deleteArticle(
        article.publicId,
        article.author?.username ?? ''
      );

      if (status === 200) {
        toast.add({ type: 'info', description: message });
        setDeleteDialogOpen(false);
      } else {
        toast.add({ type: 'error', description: message });
      }
    });
  };

  const handleMoveToDraft = () => {
    startTransition(async () => {
      const { status, message } = await moveArticleToDraft(
        article.publicId,
        article.author?.username ?? ''
      );

      if (status === 200) {
        toast.add({ type: 'info', description: message });
      } else {
        toast.add({ type: 'error', description: message });
      }
    });
  };

  return (
    <ItemActions>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Article actions"
          render={
            <Button className="size-11 sm:size-8" size="icon" variant="ghost" />
          }
          title="Article actions"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-fit">
          <DropdownMenuGroup>
            {article.status === 'published' ? (
              <DropdownMenuItem
                render={
                  <Link
                    href={
                      `/@${article.author?.username}/articles/${article.slug}` as Route
                    }
                  />
                }
              >
                View
                <HugeiconsIcon
                  className="ml-auto"
                  icon={ViewIcon}
                  strokeWidth={2}
                />
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              render={<Link href={`/editor/${article.publicId}`} />}
            >
              Edit
              <HugeiconsIcon
                className="ml-auto"
                icon={Edit01Icon}
                strokeWidth={2}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <ArticleStatusActionsMenu
              onArchive={() => setArchiveDialogOpen(true)}
              onDelete={() => setDeleteDialogOpen(true)}
              onMoveToDraft={handleMoveToDraft}
              publicId={article.publicId}
              status={article.status}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ArchiveArticleDialog
        isPending={isPending}
        onConfirm={handleArchive}
        onOpenChange={setArchiveDialogOpen}
        open={archiveDialogOpen}
      />
      <DeleteArticleDialog
        isPending={isPending}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </ItemActions>
  );
}
