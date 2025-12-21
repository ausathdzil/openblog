'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

export function SignOutButton(
  props: React.ComponentProps<typeof DropdownMenuItem>,
) {
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
      onClick={handleSignOut}
      variant="destructive"
      {...props}
    >
      Sign Out
      {loading ? (
        <Spinner className="ml-auto" />
      ) : (
        <HugeiconsIcon
          className="ml-auto"
          icon={LogoutCircle02Icon}
          strokeWidth={2}
        />
      )}
    </DropdownMenuItem>
  );
}
