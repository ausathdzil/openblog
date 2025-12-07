import { createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { articles, user } from './schema';
import { spreads } from './utils';

export const db = {
  select: spreads({ articles, user }, 'select'),
  insert: spreads(
    {
      createArticle: createInsertSchema(articles, {
        status: t.UnionEnum(['draft', 'published', 'archived'], {
          error: 'Status must be either draft, published, or archived',
        }),
      }),
    },
    'insert',
  ),
  update: spreads(
    {
      updateArticle: createUpdateSchema(articles, {
        status: t.Optional(
          t.UnionEnum(['draft', 'published', 'archived'], {
            error: 'Status must be either draft, published, or archived',
          }),
        ),
      }),
    },
    'update',
  ),
} as const;
