import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
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
  page: parseAsInteger
    .withDefault(1)
    .withOptions({ shallow: false, history: 'push' }),
  limit: parseAsInteger
    .withDefault(20)
    .withOptions({ shallow: false, history: 'push' }),
};

export const loadSearchParams = createLoader(searchParamsParser);
export const searchParamsCache = createSearchParamsCache(searchParamsParser);
export const serializeSearchParams = createSerializer(searchParamsParser);
