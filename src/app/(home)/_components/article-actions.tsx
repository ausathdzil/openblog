'use client';

import {
  Delete01Icon,
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
import { DeleteArticleDialog } from '@/components/delete-article-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemActions } from '@/components/ui/item';
import { deleteArticle } from '../_lib/actions';

export function ArticleActions({
  article,
}: {
  article: ArticleModel.ArticleResponse;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  return (
    <ItemActions>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="ghost" />}>
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
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
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            variant="destructive"
          >
            Delete
            <HugeiconsIcon
              className="ml-auto"
              icon={Delete01Icon}
              strokeWidth={2}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteArticleDialog
        isPending={isPending}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </ItemActions>
  );
}
