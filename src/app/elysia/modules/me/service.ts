import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { user } from '@/db/schema';
import type { UpdateProfileBody } from './model';

export async function updateProfile(
  userId: string,
  payload: UpdateProfileBody
) {
  const { bio, website, twitter, facebook } = payload;

  const sanitizeHandle = (handle?: string | null) => {
    if (!handle) {
      return handle;
    }
    return handle.startsWith('@') ? handle.slice(1) : handle;
  };

  await db
    .update(user)
    .set({
      bio,
      website,
      twitter: sanitizeHandle(twitter),
      facebook: sanitizeHandle(facebook),
    })
    .where(eq(user.id, userId));

  return { message: 'Profile updated.' };
}
