import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ArticleEditor } from '@/app/editor/_components/article-editor';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getArtcileByPublicId } from '../_lib/data';

export async function generateMetadata({
  params,
}: PageProps<'/editor/[publicId]'>): Promise<Metadata> {
  const { publicId } = await params;
  const { article, error } = await getArtcileByPublicId(publicId);

  if (error?.status === 404 || !article) {
    return {};
  }

  return {
    title: article.title || 'Untitled Draft',
    description: article.excerpt,
  };
}

export default function EditArticlePage({
  params,
}: PageProps<'/editor/[publicId]'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="grid flex-1">
        <Suspense fallback={<Spinner className="place-self-center" />}>
          <Article params={params} />
        </Suspense>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <Button
          nativeButton={false}
          render={<Link href="/profile" />}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back
        </Button>
      </div>
    </header>
  );
}

async function Article({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const { article, error } = await getArtcileByPublicId(publicId);

  if (error?.status === 404 || !article) {
    notFound();
  }

  return (
    <ArticleEditor
      currentContent={article.content}
      currentTitle={article.title}
      publicId={publicId}
    />
  );
}
