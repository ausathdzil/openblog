import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';
import { Google } from './google';

interface SignInWithGoogleProps {
  onFormError: (message: string | null) => void;
}

export function SignInWithGoogle({ onFormError }: SignInWithGoogleProps) {
  const [isPending, startTransition] = useTransition();

  const signInWithGoogle = () => {
    onFormError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/profile',
      });

      if (error) {
        onFormError(
          error.message || 'Failed to sign in with Google. Please try again.'
        );
      }
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
        <Google className="size-5" />
        Sign in with Google
      </Button>
    </Field>
  );
}
