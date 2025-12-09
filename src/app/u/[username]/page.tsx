import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]'>): Promise<Metadata> {
  const { username } = await params;

  const { data: author, error } = await elysia.authors({ username }).get();

  if (error?.status === 404 || !author) {
    return {};
  }

  return { title: author.name };
}

export default function ProfilePage({ params }: PageProps<'/u/[username]'>) {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <Articles params={params} />
    </Suspense>
  );
}

async function Articles({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { data: author, error } = await elysia.authors({ username }).get();

  if (error?.status === 404 || !author) {
    notFound();
  }

  const { data: articles } = await elysia.articles.get({ query: { username } });

  return articles?.length === 0 ? (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No articles yet…</EmptyTitle>
      </EmptyHeader>
    </Empty>
  ) : (
    <ItemGroup className="w-full list-none gap-4">
      {articles?.map((article) => (
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
    <div className="flex w-full flex-col gap-4 px-4">
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
      <Skeleton className="h-[77.85px] w-full" />
    </div>
  );
}
