import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { elysia } from '@/lib/eden';
import { ContentEditor } from './content-editor';

export default function ArticlePage({
  params,
}: PageProps<'/profile/articles/[publicId]'>) {
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
