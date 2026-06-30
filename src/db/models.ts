import { createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { article, articleTags, tag, user } from './schema';
import { spreads } from './utils';

/** Drizzle→TypeBox field fragments for Elysia `t.Object` / OpenAPI (not the SQL client; see `@/db`). */
export const validation = {
  select: spreads({ articles: article, user, tag, articleTags }, 'select'),
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
