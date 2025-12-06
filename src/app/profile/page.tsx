import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { unauthorized } from 'next/navigation';
import { Suspense } from 'react';

import { Lead } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';
import { SignOutButton } from './sign-out-button';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_auto] gap-4 pt-safe-top">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileInfo />
      </Suspense>
      <div className="place-self-center p-8">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeftIcon /> Home
          </Link>
        </Button>
      </div>
    </main>
  );
}

async function ProfileInfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const { data: articles } = await elysia
    .authors({ handle: session.user.username ?? '' })
    .articles.get();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-8">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4">
        <Lead>{session.user.name}</Lead>
        <SignOutButton />
      </div>
      {articles?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No articles yet…</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup className="w-full list-none gap-4">
          {articles?.map((article) => (
            <li key={article.publicId}>
              <Item asChild>
                <Link href={`/articles/${article.slug}`}>
                  <ItemContent>
                    <ItemTitle>{article.title}</ItemTitle>
                    <ItemDescription>{article.excerpt}</ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            </li>
          ))}
        </ItemGroup>
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-8">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4">
        <Skeleton className="h-7 w-full rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="flex w-full flex-col gap-4 px-4">
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
      </div>
    </section>
  );
}
