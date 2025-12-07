import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { elysia } from '@/lib/eden';

export default function ArticlePage({
  params,
}: PageProps<'/profile/articles/[publicId]'>) {
  return (
    <main>
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

  return <div>{article.title}</div>;
}
