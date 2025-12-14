import Link from 'next/link';
import { Suspense } from 'react';

import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { getArticles } from './_lib/data';

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 p-4">
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles />
      </Suspense>
    </main>
  );
}

async function Articles() {
  const { articles } = await getArticles();

  if (!articles || articles.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No articles yet…</EmptyTitle>
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
                href={`/u/${article.author?.username}/articles/${article.publicId}`}
              />
            }
          >
            <ItemContent>
              <ItemTitle>{article.title}</ItemTitle>
              <ItemDescription>{article.excerpt}…</ItemDescription>
            </ItemContent>
          </Item>
        </li>
      ))}
    </ItemGroup>
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
