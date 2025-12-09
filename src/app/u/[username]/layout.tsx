import { HouseIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';
import { CreateArticleButton } from './create-article-button';
import { SignOutButton } from './sign-out-button';

export default function UserLayout({
  children,
  params,
}: LayoutProps<'/u/[username]'> & PageProps<'/u/[username]'>) {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_auto] gap-4 pt-safe-top">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <Profile params={params} />
        </Suspense>
        {children}
      </section>
      <div className="place-self-center p-8">
        <SignOutButton />
      </div>
    </main>
  );
}

async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { data: author, error } = await elysia.authors({ username }).get();

  if (error?.status === 404 || !author) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4 pl-4">
      <Muted>@{author.displayUsername}</Muted>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link href="/">
            <HouseIcon />
            Home
          </Link>
        </Button>
        {session?.user.username === author.username && (
          <CreateArticleButton username={session.user.username ?? ''} />
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full px-4">
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
