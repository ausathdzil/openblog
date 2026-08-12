'use client';

import {
  Archive03Icon,
  Delete01Icon,
  Edit01Icon,
  MoreHorizontalIcon,
  QuillWrite01Icon,
  Settings01Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type {
  ArticleListResponse,
  ArticleResponse,
} from '@/app/elysia/modules/article/model';
import { ArchiveArticleDialog } from '@/components/archive-article-dialog';
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
import { toast } from '@/components/ui/toast';
import {
  archiveArticle,
  deleteArticle,
  moveArticleToDraft,
} from '@/lib/article-actions';

type ArticleActionsArticle = ArticleResponse | ArticleListResponse;

interface ArticleActionsProps {
  article: ArticleActionsArticle;
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const { refresh, push } = useRouter();
  const pathname = usePathname();
  const isInEditor = pathname.startsWith(`/editor/${article.publicId}`);
  const isInSettings = pathname === `/editor/${article.publicId}/settings`;
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
        refresh();
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
        push('/profile');
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
        refresh();
      } else {
        toast.add({ type: 'error', description: message });
      }
    });
  };

  return (
    <>
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
            ) : (
              <DropdownMenuItem
                render={<Link href={`/preview/${article.publicId}`} />}
              >
                Preview
                <HugeiconsIcon
                  className="ml-auto"
                  icon={ViewIcon}
                  strokeWidth={2}
                />
              </DropdownMenuItem>
            )}
            {isInEditor ? null : (
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
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {article.status === 'draft' ? null : (
              <DropdownMenuItem onClick={handleMoveToDraft}>
                Draft
                <HugeiconsIcon
                  className="ml-auto"
                  icon={QuillWrite01Icon}
                  strokeWidth={2}
                />
              </DropdownMenuItem>
            )}
            {article.status === 'archived' ? null : (
              <DropdownMenuItem onClick={() => setArchiveDialogOpen(true)}>
                Archive
                <HugeiconsIcon
                  className="ml-auto"
                  icon={Archive03Icon}
                  strokeWidth={2}
                />
              </DropdownMenuItem>
            )}
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
          </DropdownMenuGroup>
          {isInSettings ? null : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={
                    <Link href={`/editor/${article.publicId}/settings`} />
                  }
                >
                  Settings
                  <HugeiconsIcon
                    className="ml-auto"
                    icon={Settings01Icon}
                    strokeWidth={2}
                  />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
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
