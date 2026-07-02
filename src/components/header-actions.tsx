import { headers } from 'next/headers';
import { Suspense } from 'react';

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
      <div className="hidden items-center gap-4 sm:flex">
        {session?.user ? <CreateArticleButton /> : null}
        <UserButton className="" session={session} />
      </div>

      <div className="-mr-3 flex items-center gap-2 sm:hidden">
        {session?.user ? <CreateArticleButton className="h-11" /> : null}
        <MobileNavSheet isSignedIn={Boolean(session?.user)} />
      </div>
    </>
  );
}

function HeaderActionsFallback() {
  return (
    <>
      <div className="hidden items-center gap-4 sm:flex">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-8 w-51 rounded-full" />
      </div>
      <div className="flex items-center gap-2 sm:hidden">
        <Skeleton className="h-11 w-27 rounded-full" />
        <Skeleton className="size-11 rounded-md" />
      </div>
    </>
  );
}
