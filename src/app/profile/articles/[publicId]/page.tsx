import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { ArticleEditor } from '../../_components/article-editor';
import { getArticle } from '../../_lib/data';

export async function generateMetadata({
  params,
}: PageProps<'/profile/articles/[publicId]'>): Promise<Metadata> {
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

export default function EditArticlePage({
  params,
}: PageProps<'/profile/articles/[publicId]'>) {
  return (
    <main className="grid min-h-screen pt-safe-top">
      <Suspense fallback={<Spinner className="place-self-center" />}>
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

  return (
    <ArticleEditor
      currentContent={article.content}
      currentTitle={article.title}
      publicId={publicId}
    />
  );
}
