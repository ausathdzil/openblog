import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Text, Title } from '@/components/typography';
import { elysia } from '@/lib/eden';

export async function generateMetadata({
  params,
}: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const { data: article, error } = await elysia.articles.lookup({ slug }).get();

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function Page({ params }: PageProps<'/articles/[slug]'>) {
  return (
    <main className="mx-auto max-w-[60ch] p-16">
      <Suspense fallback={null}>
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}

type ArticleContentProps = {
  params: Promise<{ slug: string }>;
};

async function ArticleContent({ params }: ArticleContentProps) {
  const { slug } = await params;
  const { data: article, error } = await elysia.articles.lookup({ slug }).get();

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
