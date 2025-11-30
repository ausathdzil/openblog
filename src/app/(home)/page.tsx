import { MoreHorizontalIcon } from 'lucide-react';
import { Suspense } from 'react';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
  const articles = await elysia.articles.get();

  if (articles.data?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MoreHorizontalIcon />
          </EmptyMedia>
          <EmptyTitle>No articles yet…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="list-none gap-4">
      {articles.data?.map((article) => (
        <li key={article.publicId}>
          <Item variant="muted">
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
