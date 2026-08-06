'use client';

import type { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
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
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status === 'published') {
    return null;
  }

  const handleClick = () => {
    if (!isValid) {
      toast.add({
        type: 'error',
        description: 'Please fix the errors before publishing.',
      });
      return;
    }

    if (isTitleEmpty) {
      toast.add({
        type: 'error',
        description: 'Please enter a title before publishing.',
      });
      return;
    }

    if (isContentEmpty) {
      toast.add({
        type: 'error',
        description: 'Please enter some content before publishing.',
      });
      return;
    }

    startTransition(async () => {
      const res = await updateArticle(publicId, {
        title,
        contentJson: contentJson ? structuredClone(contentJson) : undefined,
        status: status as 'draft' | 'published' | 'archived',
      });

      if (res?.error) {
        toast.add({ type: 'error', description: res.error.message });
        return;
      }

      replace(`/editor/${publicId}/settings`);
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      size="pill-sm"
      {...props}
    >
      Publish
    </Button>
  );
}
