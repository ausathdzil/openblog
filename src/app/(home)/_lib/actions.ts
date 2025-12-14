'use server';

import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ArticleModel } from '@/app/elysia/modules/article/model';
import { elysia } from '@/lib/eden';

export async function createDraft() {
  const { data, error } = await elysia.articles.post(
    {
      title: '',
      content: '',
      status: 'draft',
    },
    { headers: await headers() },
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

  if (data.author?.username) {
    revalidateTag('drafts', 'max');
    redirect(`/profile/articles/${data.publicId}`);
  }

  return {
    error: {
      status: 500,
      message: 'Unable to create draft, please try again',
    },
  };
}

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
        message:
          error.value?.message || 'An unknown error occurred, please try again',
      },
    };
  }

  if (data) {
    revalidateTag('articles', 'max');
    revalidateTag(`articles-${data.author?.username}`, 'max');
    revalidateTag(`article-${data.publicId}`, 'max');
    revalidateTag('drafts', 'max');
  }
}
