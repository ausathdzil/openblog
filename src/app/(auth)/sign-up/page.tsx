import type { Metadata } from 'next';

import { Title } from '@/components/typography';
import { SignUpForm } from '../_components/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Create your account</Title>
      </div>
      <SignUpForm />
    </div>
  );
}
