'use client';

import type { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { updateArticle } from '@/lib/article-actions';

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status === 'published') {
    return null;
  }

  const handleClick = () => {
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
        title,
        contentJson: contentJson
          ? JSON.parse(JSON.stringify(contentJson))
          : undefined,
        status: status as 'draft' | 'published' | 'archived',
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
        return;
      }

      router.push(`/editor/${publicId}/settings`);
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      size="pill-sm"
      {...props}
    >
      {isPending ? <Spinner /> : 'Publish'}
    </Button>
  );
}
