import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ContentEditor } from '../../_components/content-editor';
import { getArticle } from '../../_lib/data';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]/articles/[publicId]'>): Promise<Metadata> {
  const { publicId } = await params;
  const { article, error } = await getArticle(publicId);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title || 'Untitled Draft',
    description: article.excerpt,
  };
}

export default function ArticlePage({
  params,
}: PageProps<'/u/[username]/articles/[publicId]'>) {
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
  const { article, error } = await getArticle(publicId);

  if (error?.status === 404 || !article) {
    notFound();
  }

  return <ContentEditor initialContent={article.content} />;
}
