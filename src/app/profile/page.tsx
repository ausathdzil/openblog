import { headers } from 'next/headers';
import { unauthorized } from 'next/navigation';

import { SignOutButton } from '@/components/sign-out-button';
import { Lead } from '@/components/typography';
import { auth } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  return (
    <main className="grid min-h-screen place-items-center">
      <Lead>Hello, {session.user.name}</Lead>
      <SignOutButton />
    </main>
  );
}
