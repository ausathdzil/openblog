import type { Metadata } from 'next';

import { Muted, Title } from '@/components/typography';
import { AuthForm } from '../_components/auth-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Create your account</Title>
        <Muted className="text-balance">Sign up with your Google account</Muted>
      </div>
      <AuthForm mode="sign-up" />
    </div>
  );
}
