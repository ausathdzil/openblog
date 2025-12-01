import { createInsertSchema } from 'drizzle-typebox';
import { t } from 'elysia';

import { articles, user } from './schema';
import { spreads } from './utils';

export const db = {
  insert: spreads(
    {
      articles: createInsertSchema(articles, {
        title: t.String({
          minLength: 1,
          maxLength: 255,
          error: 'Title must be between 1 and 255 characters',
        }),
        content: t.String({ minLength: 1, error: 'Content is required' }),
        status: t.UnionEnum(['draft', 'published', 'archived'], {
          error: 'Status must be draft, published, or archived',
        }),
        authorId: t.String({ minLength: 1, error: 'Author is required' }),
      }),
    },
    'insert',
  ),
  select: spreads({ articles, user }, 'select'),
} as const;
