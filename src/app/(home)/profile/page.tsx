import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SearchInput } from '@/components/search-input';
import { Large, Muted } from '@/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getCurrentUserArticles } from '@/lib/article-data';
import { auth } from '@/lib/auth';
import { type SearchParams, searchParamsCache } from '@/lib/search-params';
import { ArticleActions } from '../_components/article-actions';
import { StatusToggle } from '../_components/status-toggle';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

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

interface ProfilePageProps {
  searchParams: Promise<SearchParams>;
}

export default function ProfilePage({ searchParams }: ProfilePageProps) {
  return (
    <NuqsAdapter>
      <main className="mx-auto grid w-full max-w-2xl gap-8 p-6 pb-32 sm:p-4">
        <Suspense fallback={<ProfileSkeleton />}>
          <Profile />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-9 w-full" />}>
          <SearchInput placeholder="Search articles…" />
        </Suspense>
        <Suspense
          fallback={<Skeleton className="h-10 w-76.75 justify-self-center" />}
        >
          <StatusToggle className="justify-self-center" />
        </Suspense>
        <Suspense fallback={<ArticlesSkeleton />}>
          <ProfileResults searchParams={searchParams} />
        </Suspense>
      </main>
    </NuqsAdapter>
  );
}

async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.username) {
    redirect('/setup');
  }

  return (
    <div className="grid grid-rows-[auto_auto_auto] gap-4">
      <Avatar className="size-36 justify-self-center">
        {session.user.image ? (
          <AvatarImage alt={session.user.name} src={session.user.image} />
        ) : null}
        <AvatarFallback className="text-6xl">
          {session.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2 text-center">
        <Large className="font-display text-3xl">{session.user.name}</Large>
        <Muted className="text-lg">@{session.user.displayUsername}</Muted>
      </div>
      <Button
        className="justify-self-center"
        nativeButton={false}
        render={<Link href="/profile/edit" />}
        size="lg"
        variant="secondary"
      >
        Edit Profile
      </Button>
    </div>
  );
}

async function ProfileResults({ searchParams }: ProfilePageProps) {
  const { status, q, page, limit } =
    await searchParamsCache.parse(searchParams);

  return <Articles limit={limit} page={page} q={q} status={status} />;
}

interface ArticlesProps {
  limit: number;
  page: number;
  q: string;
  status: 'draft' | 'published' | 'archived' | undefined;
}

async function Articles({ status, q, page, limit }: ArticlesProps) {
  const headersList = await headers();

  const { articles, error } = await getCurrentUserArticles(
    headersList,
    status,
    q,
    page,
    limit
  );

  if (error?.status === 401) {
    redirect('/sign-in');
  }

  if (articles?.data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No {status} articles found…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="list-none gap-4">
      {articles?.data.map((article) => (
        <li key={article.publicId}>
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>{article.title || 'Untitled Draft'}</ItemTitle>
              <ItemDescription>{article.excerpt}</ItemDescription>
            </ItemContent>
            <ArticleActions article={article} />
          </Item>
        </li>
      ))}
    </ItemGroup>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-rows-[auto_auto_auto] gap-4">
      <Skeleton className="size-36 animate-none justify-self-center rounded-full" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-7 w-36" />
      </div>
      <Skeleton className="h-10 w-29.25 justify-self-center" />
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
