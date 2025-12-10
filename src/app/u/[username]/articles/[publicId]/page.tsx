import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
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
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}

type ArticleContentProps = {
  params: Promise<{ publicId: string }>;
};

const DOMPurify = createDOMPurify(new JSDOM('').window);

async function renderMarkdown(markdown: string) {
  const html = await marked.parse(markdown, {
    gfm: true,
    breaks: true,
  });

  return DOMPurify.sanitize(html);
}

async function ArticleContent({ params }: ArticleContentProps) {
  const { publicId } = await params;
  const { article, error } = await getArticle(publicId);

  if (error?.status === 404 || !article) {
    notFound();
  }

  const html = await renderMarkdown(article.content ?? '');

  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto size-full px-4 py-16">
      <h1>{article.title}</h1>
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized markdown render */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
