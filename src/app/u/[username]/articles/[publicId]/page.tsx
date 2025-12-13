import { Markdown, MarkdownManager } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { getArticle } from '../_lib/data';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]/articles/[publicId]'>): Promise<Metadata> {
  const { publicId } = await params;
  const { article, error } = await getArticle(publicId);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function Page({
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

type ArticleProps = {
  params: Promise<{ publicId: string }>;
};

const extensions = [StarterKit, Markdown];
const markdownManager = new MarkdownManager({ extensions });

async function Article({ params }: ArticleProps) {
  const { publicId } = await params;
  const { article, error } = await getArticle(publicId);

  if (error?.status === 404 || !article) {
    notFound();
  }

  const content = markdownManager.parse(article.content ?? '');
  const html = renderToHTMLString({ content, extensions });

  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto size-full px-4 py-16">
      <h1>{article.title}</h1>
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
