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
        <Title className="text-2xl">Welcome to OpenBlog</Title>
        <Muted className="text-balance">
          Get started with Google or enter your email
        </Muted>
      </div>
      <AuthForm />
    </div>
  );
}
