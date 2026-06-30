import { createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { user } from '@/db/schema';

const baseSchema = createUpdateSchema(user);

export const updateProfileBody = t.Object({
  bio: baseSchema.properties.bio,
  website: baseSchema.properties.website,
  twitter: baseSchema.properties.twitter,
  facebook: baseSchema.properties.facebook,
});

export type UpdateProfileBody = typeof updateProfileBody.static;
