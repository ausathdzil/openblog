import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { getArticles, getAuthor } from './_lib/data';

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

async function Articles({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { username } = await params;
  const { q } = await searchParams;

  const { author, authorError } = await getAuthor(username);

  if (authorError?.status === 404 || !author) {
    notFound();
  }

  const { articles } = await getArticles(username, q);

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
    <ItemGroup className="w-full list-none gap-4">
      {articles.map((article) => (
        <li key={article.publicId}>
          <Item asChild>
            <Link href={`/u/${author.username}/articles/${article.publicId}`}>
              <ItemContent>
                <ItemTitle>{article.title}</ItemTitle>
                <ItemDescription>{article.excerpt}</ItemDescription>
              </ItemContent>
            </Link>
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
