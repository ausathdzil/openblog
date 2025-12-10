import { HouseIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Lead } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './_components/create-article-button';
import { SignOutButton } from './_components/sign-out-button';
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
      <div className="-translate-x-1/2 absolute bottom-4 left-1/2">
        <SignOutButton />
      </div>
    </div>
  );
}

async function Header({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="grid w-full gap-4 pt-safe-top">
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <Lead>@{author.displayUsername}</Lead>
        <UserNav
          className="-translate-x-1/2 absolute left-1/2"
          user={session?.user}
          username={username}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <HouseIcon />
              Home
            </Link>
          </Button>
          {session?.user.username === author.username && (
            <CreateArticleButton />
          )}
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
