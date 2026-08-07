'use client';

import type { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { updateArticle } from '@/lib/article-actions';

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
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isValid) {
      toast.add({
        type: 'error',
        description: 'Please fix all errors before saving.',
      });
      return;
    }

    startTransition(async () => {
      const { status, message } = await updateArticle(article.publicId, {
        title,
        contentJson: contentJson ? structuredClone(contentJson) : undefined,
        status: article.status,
      });

      if (status === 200) {
        replace(`/editor/${article.publicId}/settings`);
      } else {
        toast.add({ type: 'error', description: message });
      }
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      size="pill-sm"
      type="button"
      {...props}
    >
      Save
    </Button>
  );
}
