import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ArticleSettingsForm } from '@/app/(article)/_components/article-settings-form';
import { SettingsHeader } from '@/app/(article)/_components/settings-header';
import { Spinner } from '@/components/ui/spinner';
import { getArticleByPublicId } from '@/lib/article-data';
import { auth } from '@/lib/auth';

export default function ArticleSettingsPage(props: {
  params: Promise<{ publicId: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Settings params={props.params} />
      </Suspense>
    </div>
  );
}

async function Settings({ params }: { params: Promise<{ publicId: string }> }) {
  const headersList = await headers();
  const headersRecord = Object.fromEntries(headersList.entries());

  const session = await auth.api.getSession({
    headers: headersRecord,
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.username) {
    redirect('/setup');
  }

  const { publicId } = await params;
  const { article, error } = await getArticleByPublicId(
    headersRecord,
    publicId
  );

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
