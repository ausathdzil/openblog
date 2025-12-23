import {
  createLoader,
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { articleStatus } from '@/db/schema';

export const searchParamsParser = {
  status: parseAsStringLiteral(articleStatus.enumValues)
    .withDefault('published')
    .withOptions({ shallow: false, history: 'push' }),
  q: parseAsString
    .withDefault('')
    .withOptions({ shallow: false, history: 'replace' }),
};

export const loadSearchParams = createLoader(searchParamsParser);

export const searchParamsCache = createSearchParamsCache(searchParamsParser);
