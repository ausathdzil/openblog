import type { Metadata, Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { type SearchParams, searchParamsCache } from '@/lib/search-params';
import { Header } from '../../_components/header';
import { getAuthor, getUserArticles } from '../../_lib/data';

interface UserPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const { author } = await getAuthor(username);

  if (!author) {
    return {};
  }

  return {
    title: `@${author.displayUsername}`,
    alternates: {
      canonical: `/@${username}`,
    },
  };
}

export default function UserPage({ params, searchParams }: UserPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto grid w-full max-w-2xl gap-8 p-4 pb-32">
        <Suspense fallback={<ProfileSkeleton />}>
          <Profile params={params} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-9 w-full" />}>
          <SearchInput placeholder="Search articles…" />
        </Suspense>
        <Suspense fallback={<ArticlesSkeleton />}>
          <UserResults params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Profile({ params }: Omit<UserPageProps, 'searchParams'>) {
  'use cache';

  const { username } = await params;

  cacheTag(`author-${username}`);
  cacheLife('minutes');

  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    notFound();
  }

  return (
    <div className="grid grid-rows-[auto_auto_auto]">
      <Avatar className="size-36 justify-self-center">
        <AvatarImage src={author.image ?? ''} />
        <AvatarFallback className="text-6xl">
          {author.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-4 space-y-2 text-center">
        <Large className="font-display text-3xl">{author.name}</Large>
        <Muted className="text-lg">@{author.displayUsername}</Muted>
      </div>
    </div>
  );
}

async function UserResults({ params, searchParams }: UserPageProps) {
  const { q, page, limit } = await searchParamsCache.parse(searchParams);
  const { username } = await params;

  return <Articles limit={limit} page={page} q={q} username={username} />;
}

interface ArticlesProps {
  username: string;
  q: string;
  page: number;
  limit: number;
}

async function Articles({ username, q, page, limit }: ArticlesProps) {
  'use cache';

  cacheTag(`articles-${username}`);

  const { articles } = await getUserArticles(username, q, page, limit);

  if (articles?.data.length === 0) {
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
      {articles?.data.map((article) => (
        <li key={article.publicId}>
          <Item
            render={
              <Link
                href={
                  `/@${article.author?.username}/articles/${article.slug}` as Route
                }
              />
            }
          >
            <ItemContent>
              <ItemTitle>{article.title}</ItemTitle>
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
