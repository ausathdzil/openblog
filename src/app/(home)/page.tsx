import { cacheLife } from 'next/cache';
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
import { elysia } from '@/lib/eden';

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1">
      <section className="w-full p-4">
        <Suspense fallback={null}>
          <Articles />
        </Suspense>
      </section>
    </main>
  );
}

async function Articles() {
  'use cache';

  cacheLife('days');

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
            <Link href={`/articles/${article.publicId}`}>
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
