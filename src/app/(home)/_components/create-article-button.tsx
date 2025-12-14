'use client';

import { QuillWrite02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createDraft } from '../_lib/actions';

export function CreateArticleButton(
  props: React.ComponentProps<typeof Button>,
) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const { error } = await createDraft();

      if (error) {
        toast.error(error.message, { position: 'top-center' });
        return;
      }
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
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
