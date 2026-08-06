import { createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { article, articleStatus, articleTag, tag, user } from '@/db/schema';
import { spreads } from '@/db/utils';

const select = spreads(
  { articles: article, user, tag, articleTags: articleTag },
  'select'
);

/** Drizzle→TypeBox field fragments for Elysia `t.Object` / OpenAPI (not the SQL client; see `@/db`). */
export const validation = {
  select: {
    ...select,
    articles: {
      ...select.articles,
      status: t.UnionEnum(articleStatus),
    },
  },
  insert: spreads(
    {
      createArticle: createInsertSchema(article, {
        title: t.Optional(
          t.String({
            maxLength: 255,
            error: 'Title must be 255 characters or fewer.',
          })
        ),
        excerpt: t.Optional(
          t.Nullable(
            t.String({
              maxLength: 255,
              error: 'Excerpt must be 255 characters or fewer.',
            })
          )
        ),
        status: t.UnionEnum(articleStatus, {
          error: 'Status must be either draft, published, or archived.',
        }),
      }),
    },
    'insert'
  ),
  update: spreads(
    {
      updateArticle: createUpdateSchema(article, {
        title: t.Optional(
          t.String({
            maxLength: 255,
            error: 'Title must be 255 characters or fewer.',
          })
        ),
        excerpt: t.Optional(
          t.Nullable(
            t.String({
              maxLength: 255,
              error: 'Excerpt must be 255 characters or fewer.',
            })
          )
        ),
        status: t.Optional(
          t.UnionEnum(articleStatus, {
            error: 'Status must be either draft, published, or archived.',
            default: undefined,
          })
        ),
      }),
    },
    'update'
  ),
} as const;
