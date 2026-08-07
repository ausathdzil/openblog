'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTransition } from 'react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth-client';

export function SignOutButton(
  props: React.ComponentProps<typeof DropdownMenuItem>
) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/sign-in';
          },
          onError: (ctx) => {
            toast.add({
              type: 'error',
              description: ctx.error.message || 'An unexpected error occurred.',
            });
          },
        },
      });
    });
  };

  return (
    <DropdownMenuItem
      closeOnClick={false}
      disabled={isPending}
      onClick={handleSignOut}
      variant="destructive"
      {...props}
    >
      Sign Out
      {isPending ? (
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
