'use client';

import { FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { JSONContent } from '@tiptap/react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Button } from '@/components/ui/button';
import { updateArticle } from '@/lib/article-actions';
import { ArticleSettingsDialog } from './article-settings-dialog';

interface SaveButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'contentJson' | 'title'> {
  article: ArticleResponse;
  contentJson: JSONContent | undefined;
  isValid: boolean;
  onSaved: () => void;
  title: string;
}

export function SaveButton({
  article,
  contentJson,
  isValid,
  onSaved,
  title,
  ...props
}: SaveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !isValid) {
      toast.error('Please fix all errors before saving');
      return;
    }
    setIsOpen(open);
  };

  const handleSubmit = (values: { excerpt: string }) => {
    startTransition(async () => {
      const res = await updateArticle(article.publicId, {
        title,
        contentJson,
        excerpt: values.excerpt,
        status: 'published',
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
      } else {
        onSaved();
        setIsOpen(false);
      }
    });
  };

  return (
    <ArticleSettingsDialog
      defaultExcerpt={article.excerpt ?? ''}
      description="Changing these details will affect how your article appears in search engine results and social previews."
      isOpen={isOpen}
      isPending={isPending}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      submitIcon={<HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />}
      submitLabel="Save Changes"
      title="Update Article"
    >
      <Button disabled={isPending} size="pill-sm" type="button" {...props}>
        {isPending ? 'Saving…' : 'Save'}
      </Button>
    </ArticleSettingsDialog>
  );
}
