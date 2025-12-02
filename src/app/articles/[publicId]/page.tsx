import { notFound } from 'next/navigation';

import { Text, Title } from '@/components/typography';
import { elysia } from '@/lib/eden';

export default async function Page({
  params,
}: PageProps<'/articles/[publicId]'>) {
  const { publicId } = await params;
  const { data: article, error } = await elysia.articles({ publicId }).get();

  if (error?.status === 404) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[60ch] p-16">
      <Title>{article?.title}</Title>
      <Text>{article?.content}</Text>
    </main>
  );
}
