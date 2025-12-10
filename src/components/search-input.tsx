'use client';

import { SearchIcon } from 'lucide-react';
import { debounce, useQueryStates } from 'nuqs';
import { useEffect, useRef, useState } from 'react';

import { useMac } from '@/hooks/use-mac';
import { searchParamsParser } from '@/lib/search-params';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';
import { Kbd } from './ui/kbd';

export function SearchInput({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [{ q }, setQ] = useQueryStates(searchParamsParser);
  const isMac = useMac();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }

      if (e.key === 'esc') {
        e.preventDefault();
        setQ(null);
      }
    };

    document.addEventListener('keydown', down);

    return () => {
      document.removeEventListener('keydown', down);
    };
  }, [setQ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(
      { q: e.target.value },
      {
        limitUrlUpdates: e.target.value === '' ? undefined : debounce(300),
      },
    );
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setQ({ q: e.currentTarget.value });
    }
  };

  return (
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Search"
        autoCapitalize="off"
        autoComplete="off"
        className={className}
        name="q"
        onBlur={() => setIsFocused(false)}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleEnter}
        ref={inputRef}
        spellCheck="false"
        type="search"
        value={q}
        {...props}
      />
      {!isFocused && !q && (
        <InputGroupAddon align="inline-end">
          <Kbd className="hidden md:flex">
            {isMac ? '⌘' : 'Ctrl'}&nbsp;+&nbsp;K
          </Kbd>
        </InputGroupAddon>
      )}
      {q && (
        <InputGroupAddon align="inline-end">
          <Kbd className="hidden md:flex">Esc</Kbd>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
