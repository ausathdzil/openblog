'use client';

import { QuillWrite02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { createDraft } from '@/lib/article-actions';

export function CreateArticleButton(
  props: React.ComponentProps<typeof Button>
) {
  const [isPending, startTransition] = useTransition();

  const handleCreateArticle = () => {
    startTransition(async () => {
      const { message } = await createDraft();
      toast.add({ type: 'error', description: message });
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleCreateArticle}
      size="sm"
      variant="ghost"
      {...props}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={QuillWrite02Icon} strokeWidth={2} />
      )}
      Write
    </Button>
  );
}
