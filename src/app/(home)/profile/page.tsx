import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { SearchParams } from 'nuqs';
import { Suspense } from 'react';

import { SearchInput } from '@/components/search-input';
import { Large, Muted } from '@/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { searchParamsCache } from '@/lib/search-params';
import { StatusToggle } from '../_components/status-toggle';
import { getUserArticles } from '../_lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {};
  }

  return {
    title: session.user.name,
  };
}

export default function ProfilePage({ searchParams }: PageProps<'/profile'>) {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-4 pb-32">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
      <Suspense
        fallback={<Skeleton className="h-10 w-76.75 justify-self-center" />}
      >
        <StatusToggle className="justify-self-center" />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <SearchInput placeholder="Search articles…" />
      </Suspense>
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="grid grid-rows-[auto_auto_auto]">
      <Avatar className="size-36 justify-self-center">
        <AvatarImage src={session.user.image ?? ''} />
        <AvatarFallback className="text-6xl">
          {session.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-4 space-y-2 text-center">
        <Large className="font-display text-3xl">{session.user.name}</Large>
        <Muted className="text-lg">@{session.user.displayUsername}</Muted>
      </div>
    </div>
  );
}

type ArticlesProps = {
  searchParams: Promise<SearchParams>;
};

async function Articles({ searchParams }: ArticlesProps) {
  const { status, q } = await searchParamsCache.parse(searchParams);
  const { articles, error } = await getUserArticles(status, q);

  if (error?.status === 401) {
    redirect('/sign-in');
  }

  if (!articles || articles.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No articles found…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="list-none gap-4">
      {articles.map((article) => (
        <li key={article.publicId}>
          <Item
            render={
              <Link
                href={
                  status !== 'published'
                    ? `/editor/${article.publicId}`
                    : `/u/${article.author?.username}/articles/${article.slug} `
                }
              />
            }
          >
            <ItemContent>
              <ItemTitle>{article.title || 'Untitled Draft'}</ItemTitle>
              <ItemDescription>{article.excerpt}</ItemDescription>
            </ItemContent>
          </Item>
        </li>
      ))}
    </ItemGroup>
  );
}
function ProfileSkeleton() {
  return (
    <div className="grid grid-rows-[auto_auto_auto]">
      <Skeleton className="size-36 animate-none justify-self-center rounded-full" />
      <div className="mt-4 flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-7 w-36" />
      </div>
    </div>
  );
}

function ArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-23.75 w-full" />
      <Skeleton className="h-23.75 w-full" />
      <Skeleton className="h-23.75 w-full" />
    </div>
  );
}
