import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { getArticleByPublicId } from '@/lib/article-data';
import { auth } from '@/lib/auth';
import { ArticleEditor } from '../../_components/article-editor';

export async function generateMetadata({
  params,
}: PageProps<'/editor/[publicId]'>): Promise<Metadata> {
  const headersList = await headers();

  const { publicId } = await params;
  const { article, error } = await getArticleByPublicId(headersList, publicId);

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
}: PageProps<'/editor/[publicId]'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Article params={params} />
      </Suspense>
    </div>
  );
}

async function Article({ params }: { params: Promise<{ publicId: string }> }) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.username) {
    redirect('/setup');
  }

  const { publicId } = await params;
  const { article, error } = await getArticleByPublicId(headersList, publicId);

  if (error?.status === 404 || !article) {
    notFound();
  }

  return <ArticleEditor article={article} />;
}
