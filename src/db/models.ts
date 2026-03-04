import { createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { article, user } from './schema';
import { spreads } from './utils';

export const db = {
  select: spreads({ articles: article, user }, 'select'),
  insert: spreads(
    {
      createArticle: createInsertSchema(article, {
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
      updateArticle: createUpdateSchema(article, {
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
