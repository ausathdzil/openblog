import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { auth } from '@/lib/auth';
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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.username !== article.author?.username) {
    redirect(`/u/${article.author?.username}/articles/${publicId}`);
  }

  return (
    <ContentEditor
      initialContent={article.content}
      initialTitle={article.title}
    />
  );
}
