import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown, MarkdownManager } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import {
  renderToHTMLString,
  serializeChildrenToHTMLString,
} from '@tiptap/static-renderer/pm/html-string';
import { toHtml } from 'hast-util-to-html';
import { common, createLowlight } from 'lowlight';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getArticleBySlug } from '@/app/(home)/_lib/data';
import { Spinner } from '@/components/ui/spinner';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]/articles/[slug]'>): Promise<Metadata> {
  const { username, slug } = await params;
  const { article, error } = await getArticleBySlug(slug, username);

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
    <main className="grid min-h-screen pt-safe-top">
      <Suspense fallback={<Spinner className="place-self-center" />}>
        <Article params={params} />
      </Suspense>
    </main>
  );
}

type ArticleProps = {
  params: Promise<{ username: string; slug: string }>;
};

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
  const { username, slug } = await params;
  const { article, error } = await getArticleBySlug(slug, username);

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
    <article className="prose prose-neutral dark:prose-invert mx-auto size-full p-8">
      <h1>{article.title}</h1>
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
