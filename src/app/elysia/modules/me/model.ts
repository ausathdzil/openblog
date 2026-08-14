import { t } from 'elysia';

import { validation } from './validation';

export const updateProfileResponse = t.Object({
  message: t.String(),
});

export const updateProfileInvalid = t.Object({
  message: t.String(),
});

export const updateProfileBody = t.Object({
  bio: validation.updateProfile.properties.bio,
  website: validation.updateProfile.properties.website,
  twitter: validation.updateProfile.properties.twitter,
  facebook: validation.updateProfile.properties.facebook,
});

export type UpdateProfileBody = typeof updateProfileBody.static;

export const updateAvatarBody = t.Object({
  file: t.File({
    type: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: '2m',
    error: 'Avatar must be a JPEG, PNG, or WebP image no larger than 2MB.',
  }),
});

export const updateAvatarResponse = t.Object({
  message: t.String(),
  url: t.String(),
});

export const updateAvatarInvalid = t.Object({
  message: t.String(),
});
export const removeAvatarResponse = t.Object({
  message: t.String(),
});

export const removeAvatarInvalid = t.Object({
  message: t.String(),
});
