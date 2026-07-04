'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { UpdateArticleBody } from '@/app/elysia/modules/article/model';
import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';

export async function deleteArticle(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .delete({}, { headers: headersList });

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value.message || 'An unknown error occurred. Please try again.',
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
      message: 'Unable to delete article. Please try again.',
    },
  };
}

export async function archiveArticle(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'archived' }, { headers: headersList });

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value.message || 'An unknown error occurred. Please try again.',
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
      message: 'Unable to archive article. Please try again.',
    },
  };
}

export async function moveArticleToDraft(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'draft' }, { headers: headersList });

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value.message || 'An unknown error occurred. Please try again.',
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
      message: 'Unable to move article to draft. Please try again.',
    },
  };
}

export async function updateArticle(
  publicId: string,
  { title, contentJson, excerpt, coverImage, status, tags }: UpdateArticleBody
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia.articles({ publicId }).patch(
    {
      title,
      contentJson,
      excerpt,
      coverImage,
      status,
      tags,
    },
    {
      headers: headersList,
    }
  );

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value.message || 'An unknown error occurred. Please try again.',
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
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia.articles.post(
    {
      title: '',
      contentJson: {},
      status: 'draft',
    },
    { headers: headersList }
  );

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value.message || 'An unknown error occurred. Please try again.',
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
      message: 'Unable to create draft. Please try again',
    },
  };
}
