import Image from 'next/image';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

interface SignInWithGoogleProps {
  onFormError: (message: string | null) => void;
}

export function SignInWithGoogle({ onFormError }: SignInWithGoogleProps) {
  const [isPending, startTransition] = useTransition();

  const signInWithGoogle = () => {
    startTransition(async () => {
      onFormError(null);
      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: '/setup',
        },
        {
          onError: (ctx) => {
            onFormError(ctx.error.message || 'An unexpected error occurred');
          },
        }
      );
    });
  };

  return (
    <Field>
      <Button
        className="gap-2.5"
        disabled={isPending}
        onClick={signInWithGoogle}
        size="lg"
        type="button"
        variant="outline"
      >
        <Image
          alt="Google"
          className="size-5"
          height={20}
          src="/google.svg"
          width={20}
        />
        Continue with Google
      </Button>
    </Field>
  );
}
