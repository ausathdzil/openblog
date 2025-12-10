import {
  createLoader,
  createSearchParamsCache,
  parseAsString,
} from 'nuqs/server';

export const searchParamsParser = {
  q: parseAsString.withDefault('').withOptions({ shallow: false }),
};

export const loadSearchParams = createLoader(searchParamsParser);

export const searchParamsCache = createSearchParamsCache(searchParamsParser);
