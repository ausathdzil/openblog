import * as z from 'zod';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export const ACCEPT_IMAGE_STRING =
  'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

export function isAllowedImageExtension(fileName: string): boolean {
  if (!fileName.includes('.')) {
    return false;
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) {
    return false;
  }
  return ALLOWED_IMAGE_EXTENSIONS.includes(
    ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number]
  );
}

export function createImageFileSchema(
  maxSize: number,
  label = 'Image',
  maxSizeLabel?: string
) {
  const sizeMessage =
    maxSizeLabel ??
    `${label} must be less than ${Math.round(maxSize / (1024 * 1024))}MB.`;

  return z.file(`Please select a ${label.toLowerCase()} file.`).check(
    z.minSize(1, `${label} cannot be empty.`),
    z.maxSize(maxSize, sizeMessage),
    z.mime(
      [...ALLOWED_IMAGE_TYPES],
      `${label} must be a JPEG (.jpg, .jpeg), PNG (.png), or WebP (.webp) image.`
    ),
    z.refine((file) => isAllowedImageExtension(file.name), {
      message: `${label} must have a valid extension (.jpg, .jpeg, .png, or .webp).`,
    })
  );
}

export async function canBrowserDecodeImage(file: File): Promise<boolean> {
  if (typeof window === 'undefined') {
    return true;
  }

  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      return true;
    } catch {
      return false;
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}
