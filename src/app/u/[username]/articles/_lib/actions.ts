'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';

import type { ArticleModel } from '@/app/elysia/modules/article/model';
import { elysia } from '@/lib/eden';

export async function updateArticle(
  publicId: string,
  { title, content, coverImage }: ArticleModel.UpdateArticleBody,
) {
  const { data, error } = await elysia.articles({ publicId }).patch(
    {
      title,
      content,
      coverImage,
    },
    {
      headers: await headers(),
    },
  );

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message: error.value?.message || 'An unknown error occurred',
      },
    };
  }

  if (data) {
    updateTag('articles');
    updateTag(`article-${data.publicId}`);
    updateTag(`article-${data.author?.username}`);
    updateTag(`drafts-${data.author?.username}`);
  }
}
