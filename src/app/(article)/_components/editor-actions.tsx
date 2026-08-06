'use client';

import { MoreHorizontalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { ArchiveArticleDialog } from '@/components/archive-article-dialog';
import { ArticleStatusActionsMenu } from '@/components/article-status-actions-menu';
import { DeleteArticleDialog } from '@/components/delete-article-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import {
  archiveArticle,
  deleteArticle,
  moveArticleToDraft,
} from '@/lib/article-actions';

export function EditorActions({ article }: { article: ArticleResponse }) {
  const { refresh, push } = useRouter();
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
        toast.add({ type: 'error', description: res.error.message });
        return;
      }
      toast.add({ type: 'info', description: res.message });
      setArchiveDialogOpen(false);
      refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteArticle(
        article.publicId,
        article.author?.username ?? ''
      );

      if (res.error) {
        toast.add({ type: 'error', description: res.error.message });
        return;
      }
      toast.add({ description: res.message });
      setDeleteDialogOpen(false);
      push('/profile');
    });
  };

  const handleMoveToDraft = () => {
    startTransition(async () => {
      const res = await moveArticleToDraft(
        article.publicId,
        article.author?.username ?? ''
      );

      if (res.error) {
        toast.add({ type: 'error', description: res.error.message });
        return;
      }
      toast.add({ type: 'info', description: res.message });
      refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Actions"
          render={
            <Button className="size-11 sm:size-8" size="icon" variant="ghost" />
          }
          title="Actions"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-fit">
          <ArticleStatusActionsMenu
            onArchive={() => setArchiveDialogOpen(true)}
            onDelete={() => setDeleteDialogOpen(true)}
            onMoveToDraft={handleMoveToDraft}
            publicId={article.publicId}
            status={article.status}
          />
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
    </>
  );
}
