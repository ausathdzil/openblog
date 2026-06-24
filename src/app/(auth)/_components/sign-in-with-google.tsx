import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';
import { Google } from './google';

interface SignInWithGoogleProps {
  onFormError: (message: string | null) => void;
}

export function SignInWithGoogle({ onFormError }: SignInWithGoogleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = () => {
    authClient.signIn.social(
      {
        provider: 'google',
        callbackURL: '/setup',
      },
      {
        onRequest: () => {
          onFormError(null);
          setIsLoading(true);
        },
        onError: (ctx) => {
          onFormError(ctx.error.message || 'An unexpected error occurred');
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Field>
      <Button
        className="gap-2.5"
        disabled={isLoading}
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
