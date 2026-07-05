import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ProfileForm } from '@/components/profile-form';
import { Title } from '@/components/typography';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Set Up Profile',
};

export default async function SetupPage() {
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
        <Title className="text-2xl">Set up your profile</Title>
      </div>
      <ProfileForm
        name={session.user.name ?? ''}
        redirectPath="/profile"
        submitLabel="Complete Setup"
        username={session.user.displayUsername ?? ''}
      />
    </div>
  );
}
