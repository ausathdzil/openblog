import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Metadata, Route } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import rehypeHighlight from 'rehype-highlight';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

import { Header } from '@/components/header';
import { HeaderActions } from '@/components/header-actions';
import { HeaderTitle } from '@/components/header-title';
import { OpenBlogButton } from '@/components/openblog-button';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getArticleByPublicId } from '@/lib/article-data';
import { auth } from '@/lib/auth';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const headersList = await headers();

  const { publicId } = await params;
  const { article, error } = await getArticleByPublicId(headersList, publicId);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: `Preview: ${article.title || 'Untitled Draft'}`,
    description: article.excerpt,
  };
}

export default function PreviewArticlePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Article params={params} />
      </Suspense>
    </div>
  );
}

const extensions = [StarterKit];

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

  const rawHtml = article.contentJson
    ? generateHTML(article.contentJson as JSONContent, extensions)
    : '';

  const html = rawHtml
    ? String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeHighlight, { detect: true })
          .use(rehypeStringify)
          .process(rawHtml)
      )
    : '';

  const renderedArticleBody = (
    <div
      className="[&_pre]:max-w-full [&_pre]:overflow-x-auto"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML generated from trusted markdown pipeline.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  return (
    <>
      <Header>
        <Header.Nav>
          <OpenBlogButton />
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/explore" />}
            size="sm"
            variant="ghost"
          >
            Explore
          </Button>
        </Header.Nav>
        <HeaderTitle>{article.title || 'Untitled Draft'}</HeaderTitle>
        <Header.Actions>
          <HeaderActions />
        </Header.Actions>
      </Header>
      <main className="grid min-h-screen">
        <article className="prose prose-neutral dark:prose-invert mx-auto size-full min-w-0 p-6 sm:p-4">
          <h1>{article.title}</h1>
          <p className="font-semibold text-2xl">{article.excerpt}</p>
          <div className="not-prose flex items-center gap-1">
            <Link href={`/@${article.author?.username}` as Route}>
              {article.author?.name}
            </Link>
            <span>&bull;</span>
            <time dateTime={article.createdAt.toISOString().split('T')[0]}>
              {article.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
          {renderedArticleBody}
        </article>
      </main>
    </>
  );
}
