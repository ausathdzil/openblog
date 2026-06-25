'use client';

import { Key01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface SignInWithPasskeyProps {
  onFormError: (error: string | null) => void;
}

export function SignInWithPasskey({ onFormError }: SignInWithPasskeyProps) {
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const handleSignIn = () => {
    onFormError(null);
    startTransition(async () => {
      const { data, error } = await authClient.signIn.passkey();

      if (error) {
        onFormError(error.message || 'Failed to sign in with passkey');
      } else if (data) {
        push('/profile');
      }
    });
  };

  return (
    <Button
      className="gap-2.5"
      disabled={isPending}
      onClick={handleSignIn}
      type="button"
      variant="outline"
    >
      <HugeiconsIcon className="size-5" icon={Key01Icon} strokeWidth={2} />
      Sign in with Passkey
    </Button>
  );
}
