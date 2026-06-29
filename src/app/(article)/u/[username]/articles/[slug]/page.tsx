import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import rehypeHighlight from 'rehype-highlight';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

import { Header } from '@/app/(article)/_components/header';
import { HeaderActions } from '@/components/header-actions';
import { Spinner } from '@/components/ui/spinner';
import { getUserArticleBySlug } from '@/lib/article-data';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]/articles/[slug]'>): Promise<Metadata> {
  const { username, slug } = await params;
  const { article, error } = await getUserArticleBySlug(slug, username);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/@${username}/articles/${slug}`,
    },
  };
}

export default function Page({
  params,
}: PageProps<'/u/[username]/articles/[slug]'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Article params={params} />
      </Suspense>
    </div>
  );
}

interface ArticleProps {
  params: Promise<{ username: string; slug: string }>;
}

const extensions = [StarterKit];

async function Article({ params }: ArticleProps) {
  const { username, slug } = await params;
  const { article, error } = await getUserArticleBySlug(slug, username);

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
          .use(rehypeHighlight)
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
      <Header title={article.title || 'Untitled Draft'}>
        <HeaderActions />
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
