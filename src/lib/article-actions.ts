'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { UpdateArticleBody } from '@/app/elysia/modules/article/model';
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
    updateTag('articles');
    updateTag(`articles-${username}`);
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
    updateTag('articles');
    updateTag(`articles-${username}`);
    updateTag(`article-${data.slug}`);
    return { message: 'Article archived' };
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
    updateTag('articles');
    updateTag(`articles-${username}`);
    updateTag(`article-${data.slug}`);
    return { message: 'Article moved to draft' };
  }

  return {
    error: {
      status: 500,
      message: 'Unable to move article to draft, please try again',
    },
  };
}

export async function updateArticle(
  publicId: string,
  {
    title,
    content,
    contentJson,
    excerpt,
    coverImage,
    status,
  }: UpdateArticleBody
) {
  const { data, error } = await elysia.articles({ publicId }).patch(
    {
      title,
      content,
      contentJson,
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
    if (data.status === 'published') {
      updateTag('articles');
    }
    updateTag(`articles-${data.author?.username}`);
    updateTag(`article-${data.slug}`);
    return { data };
  }
}

export async function createDraft() {
  const { data, error } = await elysia.articles.post(
    {
      title: '',
      content: '',
      contentJson: {},
      status: 'draft',
    },
    { headers: await headers() }
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
    updateTag('articles');
    updateTag(`articles-${data.author.username}`);
    updateTag(`article-${data.slug}`);
    redirect(`/editor/${data.publicId}`);
  }

  return {
    error: {
      status: 500,
      message: 'Unable to create draft, please try again',
    },
  };
}
