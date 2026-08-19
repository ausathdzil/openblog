import { describe, expect, test } from 'bun:test';

import {
  createImageFileSchema,
  isAllowedImageExtension,
} from '@/lib/image-validation';

describe('image-validation', () => {
  describe('isAllowedImageExtension', () => {
    test('returns true for allowed extensions regardless of casing', () => {
      expect(isAllowedImageExtension('photo.jpg')).toBe(true);
      expect(isAllowedImageExtension('photo.JPG')).toBe(true);
      expect(isAllowedImageExtension('photo.jpeg')).toBe(true);
      expect(isAllowedImageExtension('photo.JPEG')).toBe(true);
      expect(isAllowedImageExtension('image.png')).toBe(true);
      expect(isAllowedImageExtension('image.PNG')).toBe(true);
      expect(isAllowedImageExtension('graphic.webp')).toBe(true);
      expect(isAllowedImageExtension('graphic.WEBP')).toBe(true);
    });

    test('returns false for unsupported extensions (including HEIC / HEIF)', () => {
      expect(isAllowedImageExtension('photo.heic')).toBe(false);
      expect(isAllowedImageExtension('photo.HEIC')).toBe(false);
      expect(isAllowedImageExtension('photo.heif')).toBe(false);
      expect(isAllowedImageExtension('photo.HEIF')).toBe(false);
      expect(isAllowedImageExtension('animation.gif')).toBe(false);
      expect(isAllowedImageExtension('vector.svg')).toBe(false);
      expect(isAllowedImageExtension('photo.avif')).toBe(false);
      expect(isAllowedImageExtension('document.pdf')).toBe(false);
      expect(isAllowedImageExtension('file_without_ext')).toBe(false);
      expect(isAllowedImageExtension('')).toBe(false);
    });
  });

  describe('createImageFileSchema', () => {
    const schema = createImageFileSchema(3 * 1024 * 1024, 'Cover image');

    test('validates valid JPEG, PNG, and WebP files', () => {
      const jpg = new File(['image-data'], 'cover.jpg', { type: 'image/jpeg' });
      const jpeg = new File(['image-data'], 'cover.jpeg', {
        type: 'image/jpeg',
      });
      const png = new File(['image-data'], 'cover.png', { type: 'image/png' });
      const webp = new File(['image-data'], 'cover.webp', {
        type: 'image/webp',
      });

      expect(schema.safeParse(jpg).success).toBe(true);
      expect(schema.safeParse(jpeg).success).toBe(true);
      expect(schema.safeParse(png).success).toBe(true);
      expect(schema.safeParse(webp).success).toBe(true);
    });

    test('rejects HEIC files even if reported as image/jpeg MIME type by mobile picker', () => {
      const heicWithJpegMime = new File(['heic-bytes'], 'IMG_1234.HEIC', {
        type: 'image/jpeg',
      });
      const res = schema.safeParse(heicWithJpegMime);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((issue) =>
            issue.message.includes('valid extension')
          )
        ).toBe(true);
      }
    });

    test('rejects unsupported MIME types', () => {
      const gif = new File(['gif-bytes'], 'photo.gif', { type: 'image/gif' });
      const res = schema.safeParse(gif);
      expect(res.success).toBe(false);
    });

    test('rejects files larger than maxSize', () => {
      const largeData = new Uint8Array(4 * 1024 * 1024);
      const largeFile = new File([largeData], 'large.png', {
        type: 'image/png',
      });
      const res = schema.safeParse(largeFile);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((issue) => issue.message.includes('less than'))
        ).toBe(true);
      }
    });
  });
});
