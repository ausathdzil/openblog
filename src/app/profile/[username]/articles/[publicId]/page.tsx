import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { elysia } from '@/lib/eden';
import { ContentEditor } from './content-editor';

export async function generateMetadata({
  params,
}: PageProps<'/profile/[username]/articles/[publicId]'>): Promise<Metadata> {
  const { publicId } = await params;
  const { data: article, error } = await elysia.articles({ publicId }).get();

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function ArticlePage({
  params,
}: PageProps<'/profile/[username]/articles/[publicId]'>) {
  return (
    <main className="grid min-h-screen pt-safe-top">
      <Suspense fallback={null}>
        <Article params={params} />
      </Suspense>
    </main>
  );
}

async function Article({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const { data: article, error } = await elysia.articles({ publicId }).get();

  if (error?.status === 404 || !article) {
    notFound();
  }

  return <ContentEditor initialContent={article.content} />;
}
