'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth/client';
import { Button } from './ui/button';

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
      size="pill-sm"
      type="button"
      variant="destructive"
      {...props}
    >
      Sign Out
    </Button>
  );
}
