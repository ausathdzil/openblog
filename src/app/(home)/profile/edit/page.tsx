import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Muted, Title } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { MobileSignOutButton } from '../../_components/mobile-sign-out-button';
import { UpdateNameForm } from './_components/update-name-form';

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

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-4 pb-32">
      <div className="space-y-2">
        <Title>Edit profile</Title>
        <Muted className="text-center">
          Manage your account settings and security details.
        </Muted>
      </div>
      <ItemGroup>
        <Item variant="outline">
          <ItemContent className="gap-6">
            <div className="space-y-1">
              <ItemTitle>Update Name</ItemTitle>
              <ItemDescription>
                This updates the name shown on your profile.
              </ItemDescription>
            </div>
            <UpdateNameForm currentName={session.user.name} />
          </ItemContent>
        </Item>
      </ItemGroup>
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
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-4 pb-32">
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
