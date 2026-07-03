import { headers } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './create-article-button';
import { guestLinks, MobileNavSheet, userLinks } from './mobile-nav-sheet';
import { MobileSignOutButton } from './mobile-sign-out-button';
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
        <MobileNavSheet
          footerAction={
            session?.user ? (
              <MobileSignOutButton className="h-11 flex-1" />
            ) : (
              <Button
                className="h-11 flex-1"
                nativeButton={false}
                render={<Link href="/sign-in" />}
                size="pill-sm"
              >
                Get Started
              </Button>
            )
          }
          links={session?.user ? userLinks : guestLinks}
        />
      </div>
    </>
  );
}

function HeaderActionsFallback() {
  return <Skeleton className="h-8 w-31 rounded-full" />;
}
