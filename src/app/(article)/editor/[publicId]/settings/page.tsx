import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { ArticleSettingsForm } from '@/app/(article)/_components/article-settings-form';
import { SettingsHeader } from '@/app/(article)/_components/settings-header';
import { UserButton } from '@/components/user-button';
import { getArticleByPublicId } from '@/lib/article-data';
import { auth } from '@/lib/auth';

export default async function ArticleSettingsPage(props: {
  params: Promise<{ publicId: string }>;
}) {
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

  const { publicId } = await props.params;
  const { article, error } = await getArticleByPublicId(
    headersRecord,
    publicId
  );

  if (error?.status === 404 || !article) {
    notFound();
  }

  return (
    <>
      <SettingsHeader publicId={publicId}>
        <UserButton session={session} />
      </SettingsHeader>
      <main className="p-6 sm:p-4">
        <ArticleSettingsForm article={article} />
      </main>
    </>
  );
}
