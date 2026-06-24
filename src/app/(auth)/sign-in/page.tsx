import type { Metadata } from 'next';

import { AuthForm } from '../_components/auth-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <AuthForm />
    </div>
  );
}
