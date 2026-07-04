import { t } from 'elysia';

import { validation } from './validation';

const { tag } = validation.select;

export const tagResponse = t.Object({
  name: tag.name,
  slug: tag.slug,
});

export type TagResponse = typeof tagResponse.static;

export const tagsResponse = t.Array(tagResponse);

export type TagsResponse = typeof tagsResponse.static;

export const tagInvalid = t.Object({ message: t.String() });
