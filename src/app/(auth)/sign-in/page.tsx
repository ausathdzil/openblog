import type { Metadata } from 'next';

import { Muted, Title } from '@/components/typography';
import { SignInForm } from '../_components/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Sign in to your account</Title>
        <Muted className="text-balance">Enter your credentials below</Muted>
      </div>
      <SignInForm />
    </div>
  );
}
