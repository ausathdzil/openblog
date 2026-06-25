import { headers } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './create-article-button';
import { MobileNavSheet } from './mobile-nav-sheet';
import { UserButton } from './user-button';

export function HeaderActions() {
  return (
    <Suspense fallback={<HeaderActionsFallback />}>
      <HeaderActionsContent />
    </Suspense>
  );
}

async function HeaderActionsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <UserButton className="hidden sm:flex" session={session} />
      <div className="flex items-center gap-2 sm:hidden">
        {session?.user ? (
          <CreateArticleButton className="h-11 px-3" />
        ) : (
          <Button
            className="h-11 px-4"
            nativeButton={false}
            render={<Link href="/sign-in" />}
            size="pill-sm"
          >
            Get Started
          </Button>
        )}
        <MobileNavSheet isSignedIn={Boolean(session?.user)} />
      </div>
    </>
  );
}

function HeaderActionsFallback() {
  return (
    <>
      <Skeleton className="hidden h-8 w-51 rounded-full sm:block" />
      <div className="flex items-center gap-2 sm:hidden">
        <Skeleton className="h-11 w-27 rounded-full" />
        <Skeleton className="size-11 rounded-md" />
      </div>
    </>
  );
}
