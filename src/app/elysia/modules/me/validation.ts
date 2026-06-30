import { createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { user } from '@/db/schema';

export const validation = {
  updateProfile: createUpdateSchema(user, {
    bio: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 500,
          error: 'Bio must be 500 characters or fewer.',
        })
      )
    ),
    website: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 255,
          error: 'Website URL must be 255 characters or fewer.',
        })
      )
    ),
    twitter: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 15,
          error: 'Twitter handle must be 15 characters or fewer.',
        })
      )
    ),
    facebook: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 50,
          error: 'Facebook handle must be 50 characters or fewer.',
        })
      )
    ),
  }),
};
