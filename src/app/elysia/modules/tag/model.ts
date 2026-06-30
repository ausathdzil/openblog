import { t } from 'elysia';

export const tagResponse = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
});

export type TagResponse = typeof tagResponse.static;
