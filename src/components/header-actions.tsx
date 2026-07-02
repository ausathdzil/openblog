import { headers } from 'next/headers';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './create-article-button';
import { MobileNavSheet } from './mobile-nav-sheet';
import { Button } from './ui/button';
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
        {session?.user ? (
          <CreateArticleButton className="h-11" />
        ) : (
          <Button className="h-11" size="pill-sm">
            Get Started
          </Button>
        )}
        <MobileNavSheet isSignedIn={Boolean(session?.user)} />
      </div>
    </>
  );
}

function HeaderActionsFallback() {
  return <Skeleton className="h-8 w-31 rounded-full" />;
}
