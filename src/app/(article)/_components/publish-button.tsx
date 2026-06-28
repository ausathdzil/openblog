'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [isOpen, setIsOpen] = useState(false);
  const [excerpt, setExcerpt] = useState('');

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

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateArticle(publicId, {
        status: 'published',
        excerpt,
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
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger
        render={
          <Button
            disabled={isPending || isPublished}
            size="pill-sm"
            {...props}
          />
        }
      >
        {isPublished ? 'Published' : 'Publish'}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ready to publish?</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handlePublish}>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief summary of your article..."
              rows={3}
              value={excerpt}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? 'Publishing...' : 'Confirm Publish'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
