import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ArticleSettingsForm } from '@/app/(article)/_components/article-settings-form';
import { SettingsHeader } from '@/app/(article)/_components/settings-header';
import { Spinner } from '@/components/ui/spinner';
import { getArticleByPublicId } from '@/lib/article-data';
import { auth } from '@/lib/auth';

export async function generateMetadata({
  params,
}: PageProps<'/editor/[publicId]/settings'>): Promise<Metadata> {
  const headersList = await headers();

  const { publicId } = await params;
  const { article, error } = await getArticleByPublicId(headersList, publicId);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: `Settings: ${article.title || 'Untitled Draft'}`,
    description: article.excerpt,
  };
}

export default function ArticleSettingsPage({
  params,
}: PageProps<'/editor/[publicId]/settings'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Settings params={params} />
      </Suspense>
    </div>
  );
}

async function Settings({ params }: { params: Promise<{ publicId: string }> }) {
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

  return (
    <>
      <SettingsHeader publicId={publicId} />
      <main className="p-6 sm:p-4">
        <ArticleSettingsForm article={article} />
      </main>
    </>
  );
}
