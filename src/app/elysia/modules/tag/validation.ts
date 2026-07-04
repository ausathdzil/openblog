import { createInsertSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { tag } from '@/db/schema';
import { spreads } from '@/db/utils';

export const validation = {
  select: spreads({ tag }, 'select'),
  insert: spreads(
    {
      createTag: createInsertSchema(tag, {
        name: t.String({
          maxLength: 50,
          error: 'Each tag must be 50 characters or fewer.',
        }),
      }),
    },
    'insert'
  ),
} as const;

export const tagArrayValidation = t.Optional(
  t.Array(validation.insert.createTag.name, {
    maxItems: 5,
    error: 'You can only add up to 5 tags.',
  })
);
