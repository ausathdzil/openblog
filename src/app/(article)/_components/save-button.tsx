'use client';

import type { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import type { ArticleResponse } from '@/app/elysia/modules/article/model';
import { Button } from '@/components/ui/button';
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
      toast.error('Please fix all errors before saving');
      return;
    }

    startTransition(async () => {
      const res = await updateArticle(article.publicId, {
        title,
        contentJson: contentJson ? structuredClone(contentJson) : undefined,
        status: article.status,
      });

      if (res?.error) {
        toast.error(res.error.message, { position: 'top-center' });
        return;
      }

      replace(`/editor/${article.publicId}/settings`);
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
