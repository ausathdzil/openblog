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
