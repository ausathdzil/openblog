'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { updateArticle } from '@/lib/article-actions';

interface PublishButtonProps extends React.ComponentProps<typeof Button> {
  isContentEmpty: boolean;
  isTitleEmpty: boolean;
  isValid: boolean;
  onPublished: () => void;
  publicId: string;
  status: string | null;
}

export function PublishButton({
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

  if (status === 'published') {
    return null;
  }

  const handlePublish = () => {
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

    startTransition(async () => {
      const res = await updateArticle(publicId, {
        status: 'published',
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
        return;
      }

      setIsPublished(true);
      onPublished();
    });
  };

  return (
    <Button
      disabled={isPending || isPublished}
      onClick={handlePublish}
      size="pill-sm"
      {...props}
    >
      {isPublished ? 'Published' : 'Publish'}
    </Button>
  );
}
