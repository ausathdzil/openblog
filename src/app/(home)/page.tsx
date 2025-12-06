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
import { elysia } from '@/lib/eden';

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 p-4">
      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles />
      </Suspense>
    </main>
  );
}

async function Articles() {
  const { data: articles } = await elysia.articles.get();

  if (articles?.length === 0) {
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
