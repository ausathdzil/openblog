import { format } from 'date-fns';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { PaginationControl } from '@/components/pagination-control';
import { SearchInput } from '@/components/search-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { type SearchParams, searchParamsCache } from '@/lib/search-params';
import { ScopeToggle } from '../_components/scope-toggle';
import { getArticles, getAuthors } from '../_lib/data';

export const metadata: Metadata = {
  title: 'Explore',
};

type ExplorePageProps = {
  searchParams: Promise<SearchParams>;
};

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <SearchInput autoFocus placeholder="Search articles or authors…" />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-10 w-[196px] self-center" />}>
        <ScopeToggle className="self-center" />
      </Suspense>
      <Suspense fallback={<ResultsSkeleton />}>
        <ExploreResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ExploreResults({ searchParams }: ExplorePageProps) {
  const { q, page, limit, scope } = await searchParamsCache.parse(searchParams);

  if (scope === 'authors') {
    return <AuthorsResults limit={limit} page={page} q={q} />;
  }

  return <ArticlesResults limit={limit} page={page} q={q} />;
}

type ResultsProps = {
  limit: number;
  page: number;
  q: string;
};

async function ArticlesResults({ limit, page, q }: ResultsProps) {
  const { articles } = await getArticles(q, page, limit);

  if (articles?.data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No articles found…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const { totalPages } = articles?.pagination ?? {};

  return (
    <>
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
      <PaginationControl
        className="mt-auto"
        currentPage={page}
        pathname="/explore"
        totalPages={totalPages ?? 1}
      />
    </>
  );
}

async function AuthorsResults({ limit, page, q }: ResultsProps) {
  const { authors } = await getAuthors(q, page, limit);

  if (authors?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No authors found…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <ItemGroup className="grid list-none grid-cols-2 gap-4">
        {authors?.map((author) => (
          <li key={author.username}>
            <Item
              render={<Link href={`/@${author.username}` as Route} />}
              variant="outline"
            >
              <ItemMedia>
                <Avatar className="size-10">
                  <AvatarImage src={author.image ?? ''} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>@{author.displayUsername}</ItemTitle>
                <ItemDescription>
                  Joined at {format(author.createdAt, 'MMM d, yyyy')}
                </ItemDescription>
              </ItemContent>
            </Item>
          </li>
        ))}
      </ItemGroup>
      {/* <PaginationControl
        className="mt-auto"
        currentPage={page}
        pathname="/explore"
        totalPages={totalPages ?? 1}
      /> */}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
    </div>
  );
}
