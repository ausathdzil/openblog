import {
  createLoader,
  type inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { articleStatus } from '@/db/schema';

export const searchParamsParser = {
  status: parseAsStringLiteral(articleStatus)
    .withDefault('published')
    .withOptions({ shallow: false, history: 'push' }),
  q: parseAsString
    .withDefault('')
    .withOptions({ shallow: false, history: 'replace' }),
  page: parseAsInteger
    .withDefault(1)
    .withOptions({ shallow: false, history: 'push' }),
  limit: parseAsInteger
    .withDefault(20)
    .withOptions({ shallow: false, history: 'push' }),

  scope: parseAsStringLiteral(['articles', 'authors'])
    .withDefault('articles')
    .withOptions({ shallow: false, history: 'push' }),
};

export type SearchParams = inferParserType<typeof searchParamsParser>;

export const loadSearchParams = createLoader(searchParamsParser);
