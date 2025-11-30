import { table } from './schema';
import { spreads } from './utils';

export const db = {
  insert: spreads({ articles: table.articles }, 'insert'),
  select: spreads({ articles: table.articles }, 'select'),
} as const;
