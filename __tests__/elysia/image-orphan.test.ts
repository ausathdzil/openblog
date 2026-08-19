import { describe, expect, spyOn, test } from 'bun:test';
import * as blobModule from '@vercel/blob';
import { eq } from 'drizzle-orm';

import { app } from '@/app/elysia/[[...slugs]]/route';
import {
  deleteArticle,
  removeCoverImage,
  updateCoverImage,
} from '@/app/elysia/modules/article/service';
import { updateAvatar } from '@/app/elysia/modules/me/service';
import { db } from '@/db';
import { article, user } from '@/db/schema';
import { setupTestArticle } from './setup-article';
import { setupAuthContext } from './setup-auth';

const authContext = setupAuthContext();

describe('Image Orphan & Dual-write Audit', () => {
  const testArticleContext = setupTestArticle(() => authContext.testUser.id);

  describe('Server validation', () => {
    test('rejects GIF cover image upload with 422', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const gifFile = new File(
        [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
        'cover.gif',
        { type: 'image/gif' }
      );

      const formData = new FormData();
      formData.append('file', gifFile);

      const response = await app.handle(
        new Request(
          `http://localhost/elysia/articles/${testArticleContext.article.publicId}/cover-image/upload`,
          {
            method: 'POST',
            headers,
            body: formData,
          }
        )
      );

      expect(response.status).toBe(422);
      const text = await response.text();
      expect(text).toContain(
        'Cover image must be a JPEG, PNG, or WebP image no larger than 3MB.'
      );
    });

    test('rejects GIF avatar upload with 422', async () => {
      const headers = await authContext.authTest.getAuthHeaders({
        userId: authContext.testUser.id,
      });

      const gifFile = new File(
        [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
        'avatar.gif',
        { type: 'image/gif' }
      );

      const formData = new FormData();
      formData.append('file', gifFile);

      const response = await app.handle(
        new Request('http://localhost/elysia/me/avatar/upload', {
          method: 'POST',
          headers,
          body: formData,
        })
      );

      expect(response.status).toBe(422);
      const text = await response.text();
      expect(text).toContain(
        'Avatar must be a JPEG, PNG, or WebP image no larger than 2MB.'
      );
    });
  });

  describe('Article cover dual-write compensation & order', () => {
    test('cleans up orphaned cover blob when db.update throws in updateCoverImage', async () => {
      const fakeBlobUrl =
        'https://blob.vercel-storage.com/cover-images/test-orphan.webp';
      const putSpy = spyOn(blobModule, 'put').mockResolvedValueOnce({
        url: fakeBlobUrl,
        downloadUrl: fakeBlobUrl,
        pathname: 'cover-images/test.webp',
        contentType: 'image/webp',
        contentDisposition: 'inline',
      } as any);
      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const updateSpy = spyOn(db, 'update').mockImplementationOnce(() => {
        throw new Error('Simulated DB network failure');
      });

      const dummyFile = new File(['test-image-data'], 'test.webp', {
        type: 'image/webp',
      });

      let thrownError: Error | null = null;
      try {
        await updateCoverImage(
          testArticleContext.article.publicId,
          authContext.testUser.id,
          dummyFile
        );
      } catch (err: any) {
        thrownError = err;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toBe('Simulated DB network failure');
      expect(putSpy).toHaveBeenCalled();
      expect(delSpy).toHaveBeenCalledWith(fakeBlobUrl);

      putSpy.mockRestore();
      delSpy.mockRestore();
      updateSpy.mockRestore();
    });

    test('deletes old cover blob after DB update succeeds in updateCoverImage', async () => {
      const oldCoverUrl =
        'https://blob.vercel-storage.com/cover-images/old-cover.webp';
      const newBlobUrl =
        'https://blob.vercel-storage.com/cover-images/new-cover.webp';

      await db
        .update(article)
        .set({ coverImage: oldCoverUrl })
        .where(eq(article.publicId, testArticleContext.article.publicId));

      const putSpy = spyOn(blobModule, 'put').mockResolvedValueOnce({
        url: newBlobUrl,
        downloadUrl: newBlobUrl,
        pathname: 'cover-images/new-cover.webp',
        contentType: 'image/webp',
        contentDisposition: 'inline',
      } as any);
      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const dummyFile = new File(['test-image-data'], 'test.webp', {
        type: 'image/webp',
      });

      const result = await updateCoverImage(
        testArticleContext.article.publicId,
        authContext.testUser.id,
        dummyFile
      );

      expect(result.url).toBe(newBlobUrl);
      expect(delSpy).toHaveBeenCalledWith(oldCoverUrl);

      const [updatedArticle] = await db
        .select({ coverImage: article.coverImage })
        .from(article)
        .where(eq(article.publicId, testArticleContext.article.publicId));
      expect(updatedArticle?.coverImage).toBe(newBlobUrl);

      putSpy.mockRestore();
      delSpy.mockRestore();
    });

    test('deletes old cover blob after DB update succeeds in removeCoverImage', async () => {
      const oldCoverUrl =
        'https://blob.vercel-storage.com/cover-images/to-remove.webp';

      await db
        .update(article)
        .set({ coverImage: oldCoverUrl })
        .where(eq(article.publicId, testArticleContext.article.publicId));

      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const result = await removeCoverImage(
        testArticleContext.article.publicId,
        authContext.testUser.id
      );

      expect(result.message).toBe('Cover image removed.');
      expect(delSpy).toHaveBeenCalledWith(oldCoverUrl);

      const [updatedArticle] = await db
        .select({ coverImage: article.coverImage })
        .from(article)
        .where(eq(article.publicId, testArticleContext.article.publicId));
      expect(updatedArticle?.coverImage).toBeNull();

      delSpy.mockRestore();
    });

    test('deletes old cover blob after DB delete succeeds in deleteArticle', async () => {
      const oldCoverUrl =
        'https://blob.vercel-storage.com/cover-images/to-delete.webp';

      await db
        .update(article)
        .set({ coverImage: oldCoverUrl })
        .where(eq(article.publicId, testArticleContext.article.publicId));

      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const result = await deleteArticle(
        testArticleContext.article.publicId,
        authContext.testUser.id
      );

      expect(result.message).toBe('Article deleted.');
      expect(delSpy).toHaveBeenCalledWith(oldCoverUrl);

      const [deletedRecord] = await db
        .select()
        .from(article)
        .where(eq(article.publicId, testArticleContext.article.publicId));
      expect(deletedRecord).toBeUndefined();

      delSpy.mockRestore();
    });
  });

  describe('Avatar dual-write compensation & order', () => {
    test('cleans up orphaned avatar blob when db.update throws in updateAvatar', async () => {
      const fakeBlobUrl =
        'https://blob.vercel-storage.com/avatars/test-orphan.webp';
      const putSpy = spyOn(blobModule, 'put').mockResolvedValueOnce({
        url: fakeBlobUrl,
        downloadUrl: fakeBlobUrl,
        pathname: 'avatars/test.webp',
        contentType: 'image/webp',
        contentDisposition: 'inline',
      } as any);
      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const updateSpy = spyOn(db, 'update').mockImplementationOnce(() => {
        throw new Error('Simulated DB user update failure');
      });

      const dummyFile = new File(['test-avatar-data'], 'avatar.webp', {
        type: 'image/webp',
      });

      let thrownError: Error | null = null;
      try {
        await updateAvatar(authContext.testUser.id, dummyFile);
      } catch (err: any) {
        thrownError = err;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toBe('Simulated DB user update failure');
      expect(putSpy).toHaveBeenCalled();
      expect(delSpy).toHaveBeenCalledWith(fakeBlobUrl);

      putSpy.mockRestore();
      delSpy.mockRestore();
      updateSpy.mockRestore();
    });

    test('deletes old avatar blob after DB update succeeds in updateAvatar', async () => {
      const oldAvatarUrl =
        'https://blob.vercel-storage.com/avatars/old-avatar.webp';
      const newBlobUrl =
        'https://blob.vercel-storage.com/avatars/new-avatar.webp';

      await db
        .update(user)
        .set({ image: oldAvatarUrl })
        .where(eq(user.id, authContext.testUser.id));

      const putSpy = spyOn(blobModule, 'put').mockResolvedValueOnce({
        url: newBlobUrl,
        downloadUrl: newBlobUrl,
        pathname: 'avatars/new-avatar.webp',
        contentType: 'image/webp',
        contentDisposition: 'inline',
      } as any);
      const delSpy = spyOn(blobModule, 'del').mockResolvedValueOnce();

      const dummyFile = new File(['test-avatar-data'], 'avatar.webp', {
        type: 'image/webp',
      });

      const result = await updateAvatar(authContext.testUser.id, dummyFile);

      expect(result.url).toBe(newBlobUrl);
      expect(delSpy).toHaveBeenCalledWith(oldAvatarUrl);

      const [updatedUser] = await db
        .select({ image: user.image })
        .from(user)
        .where(eq(user.id, authContext.testUser.id));
      expect(updatedUser?.image).toBe(newBlobUrl);

      putSpy.mockRestore();
      delSpy.mockRestore();
    });
  });
});
