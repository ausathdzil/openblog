'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

interface MobileSignOutButtonProps extends React.ComponentProps<typeof Button> {
  onSignedOut?: () => void;
}

export function MobileSignOutButton({
  onSignedOut,
  ...props
}: MobileSignOutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            onSignedOut?.();
            push('/sign-in');
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'An unexpected error occurred');
          },
        },
      });
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleSignOut}
      variant="destructive"
      {...props}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
      )}
      Sign Out
    </Button>
  );
}
