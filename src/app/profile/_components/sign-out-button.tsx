'use client';

import { LogoutCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

export function SignOutButton(props: React.ComponentProps<typeof Button>) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const key = crypto.randomUUID();

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
        headers: {
          'Idempotency-Key': key,
        },
      },
    });
  };

  return (
    <Button
      disabled={loading}
      onClick={handleSignOut}
      size="sm"
      variant="destructive"
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={LogoutCircle02Icon} strokeWidth={2} />
      )}
      Sign Out
    </Button>
  );
}
