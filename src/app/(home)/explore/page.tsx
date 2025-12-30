import type { Metadata } from 'next';
import Link from 'next/link';
import type { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { PaginationControl } from '@/components/pagination-control';
import { SearchInput } from '@/components/search-input';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { searchParamsCache } from '@/lib/search-params';
import { getArticles } from '../_lib/data';

export const metadata: Metadata = {
  title: 'Explore',
};

export default function ExplorePage({ searchParams }: PageProps<'/explore'>) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <SearchInput autoFocus placeholder="Search articles…" />
      </Suspense>
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

type ArticlesProps = {
  searchParams: Promise<SearchParams>;
};

async function Articles({ searchParams }: ArticlesProps) {
  const { q, page, limit } = await searchParamsCache.parse(searchParams);
  const { articles } = await getArticles(q, page, limit);

  const {
    page: currentPage,
    hasNext,
    hasPrev,
    totalPages,
  } = articles?.pagination ?? {};

  if (articles?.data.length === 0) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No articles found…</EmptyTitle>
          </EmptyHeader>
        </Empty>
        <PaginationControl
          currentPage={currentPage ?? 1}
          hasNext={hasNext ?? false}
          hasPrev={hasPrev ?? false}
          pathname="/explore"
          totalPages={totalPages ?? 1}
        />
      </>
    );
  }

  return (
    <>
      <ItemGroup className="list-none gap-4">
        {articles?.data.map((article) => (
          <li key={article.publicId}>
            <Item
              render={
                <Link
                  href={`/u/${article.author?.username}/articles/${article.slug}`}
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
        currentPage={currentPage ?? 1}
        hasNext={hasNext ?? false}
        hasPrev={hasPrev ?? false}
        pathname="/explore"
        totalPages={totalPages ?? 1}
      />
    </>
  );
}

function ArticlesSkeleton() {
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
