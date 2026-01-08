'use client';

import { News01Icon, UserMultipleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryStates } from 'nuqs';
import { useTransition } from 'react';

import { TopLoader } from '@/components/top-loader';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { searchParamsParser } from '@/lib/search-params';

export function ScopeToggle(props: React.ComponentProps<typeof ToggleGroup>) {
  const [isPending, startTransition] = useTransition();
  const [{ scope }, setSearchParams] = useQueryStates(searchParamsParser);

  const handleScopeChange = (scope: 'articles' | 'authors') => {
    startTransition(async () => {
      await setSearchParams({ scope, page: 1 }, { startTransition });
    });
  };

  return (
    <>
      <ToggleGroup
        defaultValue={['articles']}
        onValueChange={(value) => handleScopeChange(value[0])}
        size="lg"
        spacing={2}
        value={[scope]}
        variant="outline"
        {...props}
      >
        <ToggleGroupItem value="articles">
          <HugeiconsIcon icon={News01Icon} strokeWidth={2} />
          Articles
        </ToggleGroupItem>
        <ToggleGroupItem value="authors">
          <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} />
          Authors
        </ToggleGroupItem>
      </ToggleGroup>
      <TopLoader isPending={isPending} />
    </>
  );
}
