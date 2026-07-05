'use server';

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
    return { error: { status: 401, message: 'Unauthorized' } };
  }

  const { data, error } = await elysia.me.profile.patch(values, {
    headers: headersList,
  });

  if (error) {
    return {
      error: {
        status: error.status || 500,
        message:
          error.value?.message ||
          'An unknown error occurred. Please try again.',
      },
    };
  }

  return { data };
}
