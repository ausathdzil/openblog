import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown, MarkdownManager } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import {
  renderToHTMLString,
  serializeChildrenToHTMLString,
} from '@tiptap/static-renderer/pm/html-string';
import { format } from 'date-fns';
import { toHtml } from 'hast-util-to-html';
import { common, createLowlight } from 'lowlight';
import type { Metadata, Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Header } from '@/app/(article)/_components/header';
import { getUserArticleBySlug } from '@/app/(article)/_lib/data';
import { Spinner } from '@/components/ui/spinner';

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

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({ codeBlock: false }),
  CodeBlockLowlight.configure({ lowlight }),
  Markdown.configure({
    markedOptions: {
      gfm: true,
    },
  }),
];

const markdownManager = new MarkdownManager({ extensions });

function highlightCode(code: string, language: string | null) {
  if (!language) {
    const result = lowlight.highlightAuto(code);
    return toHtml(result);
  }

  try {
    const result = lowlight.highlight(language, code);
    return toHtml(result);
  } catch {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

async function Article({ params }: ArticleProps) {
  'use cache';

  const { username, slug } = await params;

  cacheTag(`article-${slug}`);
  cacheLife('max');

  const { article, error } = await getUserArticleBySlug(slug, username);

  if (error?.status === 404 || !article) {
    notFound();
  }

  const content = markdownManager.parse(article.content ?? '');
  const html = renderToHTMLString({
    content,
    extensions,
    options: {
      nodeMapping: {
        codeBlock({ node, children }) {
          const language = node.attrs?.language || null;
          const code = serializeChildrenToHTMLString(children);
          const highlighted = highlightCode(code, language);
          const langClass = language ? ` class="language-${language}"` : '';
          return `<pre><code${langClass}>${highlighted}</code></pre>`;
        },
      },
    },
  });

  return (
    <>
      <Header title={article.title || 'Untitled Draft'} />
      <main className="grid min-h-screen">
        <article className="prose prose-neutral dark:prose-invert mx-auto size-full p-8">
          <h1>{article.title}</h1>
          <p className="font-semibold text-2xl">{article.excerpt}</p>
          <div className="not-prose flex items-center gap-1">
            <Link href={`/@${article.author?.username}` as Route}>
              {article.author?.name}
            </Link>
            <span>&bull;</span>
            <time dateTime={format(article.createdAt, 'yyyy-MM-dd')}>
              {format(article.createdAt, 'MMMM d, yyyy')}
            </time>
          </div>
          {/** biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    </>
  );
}
