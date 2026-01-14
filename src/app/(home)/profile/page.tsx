import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
import { type SearchParams, searchParamsCache } from '@/lib/search-params';
import { ArticleActions } from '../_components/article-actions';
import { EditProfileDialog } from '../_components/edit-profile-dialog';
import { StatusToggle } from '../_components/status-toggle';
import { getCurrentUserArticles } from '../_lib/data';

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

type ProfilePageProps = {
  searchParams: Promise<SearchParams>;
};

export default function ProfilePage({ searchParams }: ProfilePageProps) {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 p-4 pb-32">
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
    <div className="grid grid-rows-[auto_auto_auto] gap-4">
      <Avatar className="size-36 justify-self-center">
        <AvatarImage src={session.user.image ?? ''} />
        <AvatarFallback className="text-6xl">
          {session.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2 text-center">
        <Large className="font-display text-3xl">{session.user.name}</Large>
        <Muted className="text-lg">@{session.user.displayUsername}</Muted>
      </div>
      <EditProfileDialog user={session.user} />
    </div>
  );
}

async function ProfileResults({ searchParams }: ProfilePageProps) {
  const { status, q, page, limit } =
    await searchParamsCache.parse(searchParams);

  return <Articles limit={limit} page={page} q={q} status={status} />;
}

type ArticlesProps = {
  status: 'draft' | 'published' | 'archived' | null | undefined;
  q: string;
  page: number;
  limit: number;
};

async function Articles({ status, q, page, limit }: ArticlesProps) {
  const headersList = await headers();
  const headersRecord = Object.fromEntries(headersList.entries());

  const { articles, error } = await getCurrentUserArticles(
    headersRecord,
    status,
    q,
    page,
    limit,
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
      <Skeleton className="h-10 w-[117px] justify-self-center" />
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
