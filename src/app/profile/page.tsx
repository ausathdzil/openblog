import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Large, Muted } from '@/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {};
  }

  return {
    title: session.user.name,
  };
}

export default function ProfilePage() {
  return (
    <main className="grid">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
    </main>
  );
}

async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="grid grid-rows-[auto_auto_auto]">
      <div className="min-h-48 w-full bg-primary/50" />
      <Avatar className="-mt-18 size-36 justify-self-center">
        <AvatarImage src={session.user.image ?? ''} />
        <AvatarFallback className="text-6xl">
          {session.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-4 space-y-2 text-center">
        <Large className="font-display text-3xl">{session.user.name}</Large>
        <Muted className="text-lg">@{session.user.displayUsername}</Muted>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-rows-[auto_auto_auto]">
      <div className="min-h-48 w-full bg-primary/50" />
      <Skeleton className="-mt-18 size-36 animate-none justify-self-center rounded-full" />
      <div className="mt-4 flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-7 w-36" />
      </div>
    </div>
  );
}
