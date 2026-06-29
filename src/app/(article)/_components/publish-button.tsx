'use client';

import { QuillWrite01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { JSONContent } from '@tiptap/react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { updateArticle } from '@/lib/article-actions';
import { ArticleSettingsDialog } from './article-settings-dialog';

interface PublishButtonProps extends React.ComponentProps<typeof Button> {
  contentJson: JSONContent | undefined;
  isContentEmpty: boolean;
  isTitleEmpty: boolean;
  isValid: boolean;
  onPublished: () => void;
  publicId: string;
  status: string | null;
  title: string;
}

export function PublishButton({
  contentJson,
  title,
  isValid,
  isTitleEmpty,
  isContentEmpty,
  status,
  publicId,
  onPublished,
  ...props
}: PublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (status === 'published') {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (!isValid) {
        toast.error('Please fix all errors before publishing', {
          position: 'top-center',
        });
        return;
      }

      if (isTitleEmpty) {
        toast.error('Please enter a title before publishing', {
          position: 'top-center',
        });
        return;
      }

      if (isContentEmpty) {
        toast.error('Please enter some content before publishing', {
          position: 'top-center',
        });
        return;
      }
    }
    setIsOpen(open);
  };

  const handleSubmit = (values: { excerpt: string }) => {
    startTransition(async () => {
      const res = await updateArticle(publicId, {
        title,
        contentJson: contentJson
          ? JSON.parse(JSON.stringify(contentJson))
          : undefined,
        status: 'published',
        excerpt: values.excerpt,
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
        return;
      }

      setIsPublished(true);
      setIsOpen(false);
      onPublished();
    });
  };

  return (
    <ArticleSettingsDialog
      isOpen={isOpen}
      isPending={isPending}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      submitIcon={<HugeiconsIcon icon={QuillWrite01Icon} strokeWidth={2} />}
      submitLabel="Publish"
      title="Publish Article"
    >
      <Button disabled={isPending || isPublished} size="pill-sm" {...props}>
        {isPublished ? 'Published' : 'Publish'}
      </Button>
    </ArticleSettingsDialog>
  );
}
