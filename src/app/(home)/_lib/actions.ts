'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { elysia } from '@/lib/eden';

export async function updateBio(values: {
  bio?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia.me.profile.patch(values, {
    headers: headersList,
  });

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value?.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    revalidatePath('/profile');
    await auth.api.getSession({
      headers: headersList,
      query: { disableCookieCache: true },
    });
    return { status: 200, message: 'Profile updated.' };
  }

  return {
    status: 500,
    message: 'Unable to update profile. Please try again.',
  };
}

export async function updateAvatar(file: File) {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia.me.avatar.upload.post(
    { file },
    { headers: { cookie } }
  );

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value?.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    revalidatePath('/profile');
    await auth.api.getSession({
      headers: headersList,
      query: { disableCookieCache: true },
    });
    return { status: 200, message: data.message, url: data.url };
  }

  return {
    status: 500,
    message: 'Unable to upload avatar. Please try again.',
  };
}

export async function removeAvatar() {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { status: 401, message: 'Unauthorized.' };
  }

  const { data, error } = await elysia.me.avatar.delete(
    {},
    { headers: { cookie } }
  );

  if (error) {
    return {
      status: error.status || 500,
      message:
        error.value?.message || 'An unknown error occurred. Please try again.',
    };
  }

  if (data) {
    revalidatePath('/profile');
    await auth.api.getSession({
      headers: headersList,
      query: { disableCookieCache: true },
    });
    return { status: 200, message: data.message };
  }

  return {
    status: 500,
    message: 'Unable to remove avatar. Please try again.',
  };
}
