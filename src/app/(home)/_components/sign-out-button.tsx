'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

export function SignOutButton(props: React.ComponentProps<'button'>) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
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
    <DropdownMenuItem
      closeOnClick={false}
      disabled={loading}
      nativeButton
      render={
        <button
          className="w-full"
          disabled={loading}
          onClick={handleSignOut}
          type="button"
          {...props}
        />
      }
      variant="destructive"
    >
      {loading ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
      )}
      Sign Out
    </DropdownMenuItem>
  );
}
