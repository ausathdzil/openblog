import { del, put } from '@vercel/blob';
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

export async function updateAvatar(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const pathname = `avatars/${userId}/${crypto.randomUUID()}.${extension}`;

  const blob = await put(pathname, file, {
    access: 'public',
  });

  const [current] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, userId));

  if (current?.image?.includes('blob.vercel-storage.com')) {
    await del(current.image);
  }

  await db.update(user).set({ image: blob.url }).where(eq(user.id, userId));

  return { message: 'Avatar updated.', url: blob.url };
}
