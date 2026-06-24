'use client';

import { Key01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface SignInWithPasskeyProps {
  onFormError: (error: string | null) => void;
}

export function SignInWithPasskey({ onFormError }: SignInWithPasskeyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const handleSignIn = async () => {
    await authClient.signIn.passkey({
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          onFormError(null);
        },
        onSuccess: () => {
          push('/profile');
        },
        onError: (ctx) => {
          setIsLoading(false);
          onFormError(ctx.error.message || 'Failed to sign in with passkey');
        },
      },
    });
  };

  return (
    <Button
      className="w-full gap-2.5"
      disabled={isLoading}
      onClick={handleSignIn}
      type="button"
      variant="outline"
    >
      <HugeiconsIcon className="size-5" icon={Key01Icon} strokeWidth={2} />
      Sign in with Passkey
    </Button>
  );
}
