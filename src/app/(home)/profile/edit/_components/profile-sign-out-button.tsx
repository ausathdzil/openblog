'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

export function ProfileSignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
          router.push('/sign-in');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || 'An unexpected error occurred');
        },
      },
    });
  };

  return (
    <Button disabled={isLoading} onClick={handleSignOut} variant="destructive">
      {isLoading ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
      )}
      Sign Out
    </Button>
  );
}
