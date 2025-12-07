'use client';

import { NotebookPenIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { elysia } from '@/lib/eden';

type CreateArticleButtonProps = {
  username: string | null;
} & React.ComponentProps<typeof Button>;

export function CreateArticleButton({
  username,
  ...props
}: CreateArticleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const { data, error } = await elysia.articles.post({
        title: '',
        content: '',
        status: 'draft',
        coverImage: null,
      });

      if (error) {
        toast.error(error.value.message, { position: 'top-center' });
      }

      if (data) {
        router.push(`/profile/${username}/articles/${data.publicId}`);
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
      {isPending ? <Spinner /> : <NotebookPenIcon />}
      Write
    </Button>
  );
}
