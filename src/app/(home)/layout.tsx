import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import openblog from '@/../public/openblog.png';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './_components/create-article-button';
import { MobileNavSheet } from './_components/mobile-nav-sheet';
import { UserButton } from './_components/user-button';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 p-4 sm:gap-4">
        <nav className="flex flex-1 items-center gap-2 sm:gap-4">
          <Button
            className="gap-2"
            nativeButton={false}
            render={<Link href="/" />}
            size="sm"
            variant="ghost"
          >
            <Image
              alt="OpenBlog"
              className="dark:invert"
              height={12}
              src={openblog}
              width={12}
            />
            OpenBlog
          </Button>
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/explore" />}
            size="sm"
            variant="ghost"
          >
            Explore
          </Button>
        </nav>
        <Suspense fallback={<HeaderActionsFallback />}>
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderActions() {
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
            render={<Link href="/sign-up" />}
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
      <Skeleton className="hidden h-8 w-[204px] rounded-full sm:block" />
      <div className="flex items-center gap-2 sm:hidden">
        <Skeleton className="h-11 w-[108px] rounded-full" />
        <Skeleton className="size-11 rounded-md" />
      </div>
    </>
  );
}
