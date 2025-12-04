import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Text, Title } from '@/components/typography';
import { elysia } from '@/lib/eden';

export default async function Page({
  params,
}: PageProps<'/articles/[publicId]'>) {
  return (
    <main className="mx-auto max-w-[60ch] p-16">
      <Suspense fallback={null}>
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}

type ArticleContentProps = {
  params: Promise<{ publicId: string }>;
};

async function ArticleContent({ params }: ArticleContentProps) {
  'use cache';

  const { publicId } = await params;

  cacheTag(`article-${publicId}`);
  cacheLife('days');

  const { data: article, error } = await elysia.articles({ publicId }).get();

  if (error?.status === 404 || !article) {
    notFound();
  }

  return (
    <>
      <Title>{article.title}</Title>
      <Text>{article.content}</Text>
    </>
  );
}
