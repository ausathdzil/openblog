'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';

import type { UpdateArticleBody } from '@/app/elysia/modules/article/model';
import { elysia } from '@/lib/eden';

export async function updateArticle(
  publicId: string,
  { title, content, excerpt, coverImage, status }: UpdateArticleBody
) {
  const { data, error } = await elysia.articles({ publicId }).patch(
    {
      title,
      content,
      excerpt,
      coverImage,
      status,
    },
    {
      headers: await headers(),
    }
  );

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value?.message || 'An unknown error occurred, please try again',
      },
    };
  }

  if (data) {
    updateTag('articles');
    updateTag(`articles-${data.author?.username}`);
    updateTag(`article-${data.slug}`);
  }
}
