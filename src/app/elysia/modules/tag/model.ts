import { t } from 'elysia';

export const tagResponse = t.Object({
  name: t.String(),
  slug: t.String(),
});

export type TagResponse = typeof tagResponse.static;

export const tagsResponse = t.Array(tagResponse);

export type TagsResponse = typeof tagsResponse.static;

export const tagInvalid = t.Object({ message: t.String() });
