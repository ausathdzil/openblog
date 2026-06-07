import type { Metadata } from 'next';

import { Muted, Title } from '@/components/typography';
import { AuthForm } from '../_components/auth-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Welcome back</Title>
        <Muted className="text-balance">Sign in with your Google account</Muted>
      </div>
      <AuthForm mode="sign-in" />
    </div>
  );
}
