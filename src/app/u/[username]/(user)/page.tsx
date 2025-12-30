import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

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
import { getArticles, getAuthor } from '../../_lib/data';

export default function UserPage({
  params,
  searchParams,
}: PageProps<'/u/[username]'>) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <SearchInput placeholder="Search articles…" />
      </Suspense>
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

type ArticlesProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<SearchParams>;
};

async function Articles({ params, searchParams }: ArticlesProps) {
  const { username } = await params;
  const { q, page, limit } = await searchParamsCache.parse(searchParams);

  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    notFound();
  }

  const { articles } = await getArticles(username, q, page, limit);

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
    <ItemGroup className="w-full list-none gap-4">
      {articles?.data.map((article) => (
        <li key={article.publicId}>
          <Item
            render={
              <Link
                href={`/u/${article.author?.username}/articles/${article.publicId}`}
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

function ArticlesSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
    </div>
  );
}
