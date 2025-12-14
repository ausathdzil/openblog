import { Home01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Lead } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserNav } from './_components/user-nav';
import { getAuthor } from './_lib/data';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]'>): Promise<Metadata> {
  const { username } = await params;

  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    return {};
  }

  return { title: author.name };
}

type UserLayoutProps = LayoutProps<'/u/[username]'> &
  Omit<PageProps<'/u/[username]'>, 'searchParams'>;

export default function UserLayout({ children, params }: UserLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={<ProfileSkeleton />}>
        <Header params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function Header({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    notFound();
  }

  return (
    <header className="grid w-full gap-4 pt-safe-top">
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <Lead>@{author.displayUsername}</Lead>
        <UserNav
          className="-translate-x-1/2 absolute left-1/2"
          username={author.username ?? ''}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            size="sm"
            variant="ghost"
          >
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            Home
          </Button>
        </div>
      </div>
    </header>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid w-full gap-4 pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
