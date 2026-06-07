import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Title } from '@/components/typography';
import { auth } from '@/lib/auth';
import { UsernameForm } from '../_components/username-form';

export default async function UpdateUsernamePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.username) {
    redirect('/profile');
  }

  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Choose your username</Title>
        {/* <Muted className="text-balance">You can change this at any time.</Muted> */}
      </div>
      <UsernameForm />
    </div>
  );
}
