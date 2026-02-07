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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemActions } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
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
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot
              be undone. This will permanently delete the article and its
              content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleDelete}
              variant="destructive"
            >
              {isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
              )}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ItemActions>
  );
}
