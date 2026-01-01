'use client';

import {
  Archive03Icon,
  News01Icon,
  QuillWrite01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryStates } from 'nuqs';
import { useTransition } from 'react';

import { TopLoader } from '@/components/top-loader';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { searchParamsParser } from '@/lib/search-params';

export function StatusToggle(props: React.ComponentProps<typeof ToggleGroup>) {
  const [isPending, startTransition] = useTransition();
  const [, setSearchParams] = useQueryStates(searchParamsParser);

  const handleStatusChange = (status: 'draft' | 'published' | 'archived') => {
    startTransition(async () => {
      await setSearchParams({ status, page: 1 }, { startTransition });
    });
  };

  return (
    <>
      <ToggleGroup
        defaultValue={['published']}
        onValueChange={(value) => handleStatusChange(value[0])}
        size="lg"
        spacing={2}
        variant="outline"
        {...props}
      >
        <ToggleGroupItem value="published">
          <HugeiconsIcon icon={News01Icon} strokeWidth={2} />
          Published
        </ToggleGroupItem>
        <ToggleGroupItem value="draft">
          <HugeiconsIcon icon={QuillWrite01Icon} strokeWidth={2} />
          Drafts
        </ToggleGroupItem>
        <ToggleGroupItem value="archived">
          <HugeiconsIcon icon={Archive03Icon} strokeWidth={2} />
          Archived
        </ToggleGroupItem>
      </ToggleGroup>
      <TopLoader isPending={isPending} />
    </>
  );
}
