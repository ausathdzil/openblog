import { t } from 'elysia';

export const updateProfileResponse = t.Object({
  message: t.String(),
});

export const updateProfileInvalid = t.Object({
  message: t.String(),
});
