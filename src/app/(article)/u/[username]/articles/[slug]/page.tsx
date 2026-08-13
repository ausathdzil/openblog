import {
  generateTocIds,
  TableOfContents as TocExtension,
} from '@tiptap/extension-table-of-contents';
import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Metadata, Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import rehypeHighlight from 'rehype-highlight';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

import { ReadingToc } from '@/app/(article)/_components/reading-toc';
import type { TocAnchor } from '@/app/(article)/_components/table-of-contents';
import {
  createDeterministicGetId,
  getReadingTime,
} from '@/app/(article)/_lib/reading-time';
import { Header } from '@/components/header';
import { HeaderActions } from '@/components/header-actions';
import { OpenBlogButton } from '@/components/openblog-button';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getUserArticleBySlug } from '@/lib/article-data';

export async function generateMetadata({
  params,
}: PageProps<'/u/[username]/articles/[slug]'>): Promise<Metadata> {
  'use cache';

  const { username, slug } = await params;

  cacheTag(`article-${slug}`);
  cacheLife('max');

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
        <Header.Actions>
          <HeaderActions />
        </Header.Actions>
      </Header>
      <Suspense fallback={<Spinner className="m-auto" />}>
        <Article params={params} />
      </Suspense>
    </div>
  );
}

interface ArticleProps {
  params: Promise<{ username: string; slug: string }>;
}

const starterKitForReading = StarterKit.configure({
  heading: { levels: [1, 2, 3] },
});

async function Article({ params }: ArticleProps) {
  'use cache';

  const { username, slug } = await params;

  cacheTag(`article-${slug}`);
  cacheLife('max');

  const { article, error } = await getUserArticleBySlug(slug, username);

  if (error?.status === 404 || !article) {
    notFound();
  }

  const contentJson = article.contentJson as JSONContent | null | undefined;
  const readingTime = getReadingTime(contentJson);

  let docForHtml: JSONContent | null | undefined = contentJson;
  let tocAnchors: TocAnchor[] = [];

  if (contentJson) {
    try {
      const getId = createDeterministicGetId();
      const tocExt = TocExtension.configure({ getId });
      docForHtml = generateTocIds(contentJson, [starterKitForReading, tocExt]);
      tocAnchors = extractTocAnchors(docForHtml);
    } catch {
      tocAnchors = [];
      docForHtml = contentJson;
    }
  }

  const extensions = [starterKitForReading, TocExtension];

  const rawHtml = docForHtml ? generateHTML(docForHtml, extensions) : '';

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
      <main className="grid min-h-screen">
        <article className="prose prose-neutral dark:prose-invert mx-auto size-full min-w-0 p-6 sm:p-4">
          <h1>{article.title}</h1>
          <p className="font-semibold text-2xl">{article.excerpt}</p>
          <div className="not-prose flex items-center gap-1 text-muted-foreground text-sm">
            <Link
              className="text-foreground hover:underline"
              href={`/@${article.author?.username}` as Route}
            >
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
            <span>&bull;</span>
            <span>{readingTime}</span>
          </div>
          {renderedArticleBody}
        </article>
      </main>
      <ReadingToc anchors={tocAnchors} />
    </>
  );
}

function extractTocAnchors(doc: JSONContent): TocAnchor[] {
  const anchors: TocAnchor[] = [];
  let itemIndex = 0;

  const traverse = (node: JSONContent) => {
    if (node.type === 'heading' && node.attrs) {
      const level = node.attrs.level as number | undefined;
      const id = (node.attrs.id ?? node.attrs['data-toc-id']) as
        | string
        | undefined;
      const textContent = extractText(node);
      if (
        level !== undefined &&
        level >= 1 &&
        level <= 3 &&
        id &&
        textContent.trim().length > 0
      ) {
        itemIndex += 1;
        anchors.push({
          id,
          textContent,
          level,
          originalLevel: level,
          isActive: false,
          isScrolledOver: false,
          pos: 0,
          itemIndex,
        });
      }
    }
    if (node.content) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  };

  const extractText = (node: JSONContent): string => {
    if (node.text) {
      return node.text;
    }
    if (!node.content) {
      return '';
    }
    return node.content.map(extractText).join('');
  };

  traverse(doc);
  return anchors;
}
