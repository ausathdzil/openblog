'use client';

import dynamic from 'next/dynamic';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { SearchInput } from './search-input';
import type { InputGroupInput } from './ui/input-group';

const SearchInputInner = dynamic(
  () =>
    Promise.resolve((props: React.ComponentProps<typeof InputGroupInput>) => (
      <NuqsAdapter>
        <SearchInput {...props} />
      </NuqsAdapter>
    )),
  { ssr: false }
);

export function SearchInputWrapper(
  props: React.ComponentProps<typeof InputGroupInput>
) {
  return <SearchInputInner {...props} />;
}
