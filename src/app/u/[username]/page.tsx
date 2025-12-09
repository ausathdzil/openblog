import { HouseIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';
import { CreateArticleButton } from './create-article-button';
import { SignOutButton } from './sign-out-button';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]'>): Promise<Metadata> {
  const { username } = await params;

  const { data: author, error } = await elysia
    .authors({ handle: username })
    .get();

  if (error?.status === 404 || !author) {
    return {};
  }

  return { title: author.name };
}

export default function ProfilePage({ params }: PageProps<'/u/[username]'>) {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_auto] gap-4 pt-safe-top">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileInfo params={params} />
      </Suspense>
      <div className="place-self-center p-8">
        <SignOutButton />
      </div>
    </main>
  );
}

async function ProfileInfo({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: author, error } = await elysia
    .authors({ handle: username })
    .get();

  if (error?.status === 404 || !author) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { data: articles } = await elysia.articles.get({
    query: {
      handle: username,
    },
  });

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-8">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4 pl-4">
        <Muted>@{author.displayUsername}</Muted>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <HouseIcon />
              Home
            </Link>
          </Button>
          {session?.user.username === author.username && (
            <CreateArticleButton username={session.user.username ?? ''} />
          )}
        </div>
      </div>
      {articles?.length === 0 ? (
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
                  href={`/u/${author.username}/articles/${article.publicId}`}
                >
                  <ItemContent>
                    <ItemTitle>{article.title}</ItemTitle>
                    <ItemDescription>{article.excerpt}</ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            </li>
          ))}
        </ItemGroup>
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-8">
      <div className="w-full px-4">
        <Skeleton className="h-7 w-full" />
      </div>
      <div className="flex w-full flex-col gap-4 px-4">
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
        <Skeleton className="h-[77.85px] w-full" />
      </div>
    </section>
  );
}
