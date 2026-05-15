'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

type MobileSignOutButtonProps = React.ComponentProps<typeof Button> & {
  onSignedOut?: () => void;
};

export function MobileSignOutButton({
  onSignedOut,
  ...props
}: MobileSignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onResponse: () => {
          setIsLoading(false);
        },
        onSuccess: () => {
          onSignedOut?.();
          push('/sign-in');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || 'An unexpected error occurred');
        },
      },
    });
  };

  return (
    <Button
      disabled={isLoading}
      onClick={handleSignOut}
      variant="destructive"
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
      )}
      Sign Out
    </Button>
  );
}
