'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { UpdateArticleBody } from '@/app/elysia/modules/article/model';
import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';

export async function deleteArticle(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .delete({}, { headers: headersList });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    updateTag('articles');
    updateTag(`articles-${username}`);
    return { status: 200, message: data.message };
  }

  return {
    status: 500,
    message: 'Unable to delete article. Please try again.',
  };
}

export async function archiveArticle(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'archived' }, { headers: headersList });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    updateTag('articles');
    updateTag(`articles-${username}`);
    updateTag(`article-${data.slug}`);
    return { status: 200, message: 'Article archived.' };
  }

  return {
    status: 500,
    message: 'Unable to archive article. Please try again.',
  };
}

export async function moveArticleToDraft(publicId: string, username: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    .patch({ status: 'draft' }, { headers: headersList });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    updateTag('articles');
    updateTag(`articles-${username}`);
    updateTag(`article-${data.slug}`);
    return { status: 200, message: 'Article moved to draft.' };
  }

  return {
    status: 500,
    message: 'Unable to move article to draft. Please try again.',
  };
}

export async function updateArticle(
  publicId: string,
  { title, contentJson, excerpt, coverImage, status, tags }: UpdateArticleBody
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
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
      status: error.status || 500,
      message:
        error.value.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    if (data.status === 'published') {
      updateTag('articles');
    }
    updateTag(`articles-${data.author?.username}`);
    updateTag(`article-${data.slug}`);
    return { status: 200, message: 'Article updated.' };
  }

  return {
    status: 500,
    message: 'Unable to update article. Please try again.',
  };
}

export async function uploadCoverImage(publicId: string, file: File) {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    ['cover-image'].upload.post({ file }, { headers: { cookie } });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value?.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    revalidatePath(`/editor/${publicId}`);
    return { status: 200, message: data.message, url: data.url };
  }

  return {
    status: 500,
    message: 'Unable to upload cover image. Please try again.',
  };
}

export async function removeCoverImage(publicId: string) {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia
    .articles({ publicId })
    ['cover-image'].delete({}, { headers: { cookie } });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value?.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    revalidatePath(`/editor/${publicId}`);
    return { status: 200, message: data.message };
  }

  return {
    status: 500,
    message: 'Unable to remove cover image. Please try again.',
  };
}

export async function createDraft() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
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
      status: error.status || 500,
      message:
        error.value.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data.author?.username) {
    updateTag('articles');
    updateTag(`articles-${data.author.username}`);
    updateTag(`article-${data.slug}`);
    redirect(`/editor/${data.publicId}`);
  }

  return {
    status: 500,
    message: 'Unable to create draft. Please try again.',
  };
}
