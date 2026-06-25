import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { MobileSignOutButton } from '@/components/mobile-sign-out-button';
import { ProfileForm } from '@/components/profile-form';
import { Muted, Title } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { PasskeySettings } from '../../_components/passkey-settings';

export const metadata: Metadata = {
  title: 'Edit profile',
};

export default function EditProfilePage() {
  return (
    <Suspense fallback={<EditProfileSkeleton />}>
      <EditProfileContent />
    </Suspense>
  );
}

async function EditProfileContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.username) {
    redirect('/setup');
  }

  const passkeys = await auth.api.listPasskeys({
    headers: await headers(),
  });

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-6 pb-32 sm:p-4">
      <div className="space-y-2">
        <Title>Edit profile</Title>
        <Muted className="text-center">
          Manage your account settings and security details.
        </Muted>
      </div>
      <ProfileForm
        defaultName={session.user.name}
        defaultUsername={session.user.displayUsername ?? ''}
        submitLabel="Save Changes"
      />
      <PasskeySettings initialPasskeys={passkeys ?? []} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          className="justify-self-start"
          nativeButton={false}
          render={<Link href="/profile" />}
          variant="ghost"
        >
          Back to profile
        </Button>
        <MobileSignOutButton />
      </div>
    </main>
  );
}

function EditProfileSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-6 pb-32 sm:p-4">
      <div className="space-y-2">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="mx-auto h-5 w-80" />
      </div>
      <div className="grid gap-4">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-9 w-28" />
    </main>
  );
}
