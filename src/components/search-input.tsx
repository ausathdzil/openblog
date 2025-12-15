'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { debounce, useQueryStates } from 'nuqs';
import { useEffect, useRef, useState, useTransition } from 'react';

import { useMac } from '@/hooks/use-mac';
import { searchParamsParser } from '@/lib/search-params';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';
import { Kbd } from './ui/kbd';
import { Spinner } from './ui/spinner';

export function SearchInput({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const [isPending, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [{ q }, setSearchParams] = useQueryStates(searchParamsParser);
  const isMac = useMac();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', down);

    return () => {
      document.removeEventListener('keydown', down);
    };
  }, []);

  const handleSearch = (term: string) => {
    startTransition(async () => {
      await setSearchParams(
        { q: term },
        {
          limitUrlUpdates: term === '' ? undefined : debounce(300),
          startTransition,
        },
      );
    });
  };

  const handleKeyDown = (key: string, term: string) => {
    if (key === 'Enter') {
      setSearchParams({ q: term });
    }

    if (key === 'Escape' && term) {
      setSearchParams(null);
    }
  };

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        {isPending ? (
          <Spinner />
        ) : (
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        )}
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Search"
        autoCorrect="on"
        name="q"
        onBlur={() => setIsFocused(false)}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(e) => handleKeyDown(e.key, e.currentTarget.value)}
        ref={inputRef}
        spellCheck="true"
        type="search"
        value={q}
        {...props}
      />
      {!isFocused && !q && (
        <InputGroupAddon align="inline-end">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}&nbsp;+&nbsp;K</Kbd>
        </InputGroupAddon>
      )}
      {q && (
        <InputGroupAddon align="inline-end">
          <Kbd>Esc</Kbd>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
