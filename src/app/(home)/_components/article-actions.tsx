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
import { toast } from 'sonner';

import type { ArticleModel } from '@/app/elysia/modules/article/model';
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
import {
  archiveArticle,
  deleteArticle,
  moveArticleToDraft,
} from '@/lib/article-actions';

export function ArticleActions({
  article,
}: {
  article: ArticleModel.ArticleListResponse;
}) {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const res = await archiveArticle(
        article.publicId,
        article.author?.username ?? ''
      );

      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(res.message);
      setArchiveDialogOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteArticle(
        article.publicId,
        article.author?.username ?? ''
      );

      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(res.message);
      setDeleteDialogOpen(false);
    });
  };

  const handleMoveToDraft = () => {
    startTransition(async () => {
      const res = await moveArticleToDraft(
        article.publicId,
        article.author?.username ?? ''
      );

      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(res.message);
    });
  };

  return (
    <ItemActions>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="ghost" />}>
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-fit">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link
                  href={
                    article.status === 'published'
                      ? (`/@${article.author?.username}/articles/${article.slug}` as Route)
                      : `/editor/${article.publicId}`
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
