'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';

import { elysia } from '@/lib/eden';

export async function deleteArticle(publicId: string, username: string) {
  const { data, error } = await elysia
    .articles({ publicId })
    .delete({}, { headers: await headers() });

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
    revalidateTag(`articles-${username}`, 'max');
    revalidateTag('drafts', 'max');
    return { message: data.message };
  }

  return {
    error: {
      status: 500,
      message: 'Unable to delete article, please try again',
    },
  };
}

export async function archiveArticle(publicId: string, username: string) {
  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'archived' }, { headers: await headers() });

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
    revalidateTag(`articles-${username}`, 'max');
    revalidateTag(`article-${data.slug}`, 'max');
    revalidateTag('drafts', 'max');
    revalidatePath('/editor/[publicId]', 'page');
    return { message: 'Article archived successfully' };
  }

  return {
    error: {
      status: 500,
      message: 'Unable to archive article, please try again',
    },
  };
}

export async function moveArticleToDraft(publicId: string, username: string) {
  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'draft' }, { headers: await headers() });

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
    revalidateTag(`articles-${username}`, 'max');
    revalidateTag(`article-${data.slug}`, 'max');
    revalidateTag('drafts', 'max');
    revalidatePath('/editor/[publicId]', 'page');
    return { message: 'Article moved to draft successfully' };
  }

  return {
    error: {
      status: 500,
      message: 'Unable to move article to draft, please try again',
    },
  };
}
