import { formatDate } from 'date-fns';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
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
}: PageProps<'/u/[username]/articles/drafts'>): Promise<Metadata> {
  const { username } = await params;

  const { data: author, error } = await elysia.authors({ username }).get();

  if (error?.status === 404 || !author) {
    return {};
  }

  return { title: author.name };
}

export default function UserDraftsPage({
  params,
}: PageProps<'/u/[username]/articles/drafts'>) {
  return (
    <Suspense fallback={<UserDraftsSkeleton />}>
      <UserDrafts params={params} />
    </Suspense>
  );
}

async function UserDrafts({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: author, error: authorsError } = await elysia
    .authors({ username })
    .get();

  if (authorsError?.status === 404 || !author) {
    notFound();
  }

  const { data: articles, error: articlesError } =
    await elysia.articles.drafts.get({
      headers: await headers(),
      query: { username },
    });

  if (articlesError?.status === 403) {
    redirect(`/u/${author.username}`);
  }

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
            <Link
              href={`/u/${author.username}/articles/${article.publicId}/edit`}
            >
              <ItemContent>
                <ItemTitle>{article.title || 'Untitled Draft'}</ItemTitle>
                <ItemDescription className="tabular-nums">
                  Last Updated:{' '}
                  {formatDate(article.updatedAt, 'dd MMM yyyy, HH:mm')}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        </li>
      ))}
    </ItemGroup>
  );
}

function UserDraftsSkeleton() {
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
