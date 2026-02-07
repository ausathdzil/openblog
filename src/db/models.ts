import { createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { articles, user } from './schema';
import { spreads } from './utils';

export const db = {
  select: spreads({ articles, user }, 'select'),
  insert: spreads(
    {
      createArticle: createInsertSchema(articles, {
        excerpt: t.Optional(
          t.Nullable(
            t.String({
              maxLength: 255,
              error: 'Excerpt must be 255 characters or fewer.',
            })
          )
        ),
        status: t.UnionEnum(['draft', 'published', 'archived'], {
          error: 'Status must be either draft, published, or archived.',
        }),
      }),
    },
    'insert'
  ),
  update: spreads(
    {
      updateArticle: createUpdateSchema(articles, {
        excerpt: t.Optional(
          t.Nullable(
            t.String({
              maxLength: 255,
              error: 'Excerpt must be 255 characters or fewer.',
            })
          )
        ),
        status: t.Optional(
          t.UnionEnum(['draft', 'published', 'archived'], {
            error: 'Status must be either draft, published, or archived.',
            default: undefined,
          })
        ),
      }),
    },
    'update'
  ),
} as const;
