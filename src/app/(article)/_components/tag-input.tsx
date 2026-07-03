'use client';

import * as React from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
} from '@/components/ui/combobox';

interface TagInputProps {
  onChange: (value: string[]) => void;
  value: string[];
}

export function TagInput({ value = [], onChange }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  return (
    <Combobox
      multiple
      onOpenChange={() => undefined}
      onValueChange={(val) => {
        onChange(val as string[]);
      }}
      open={false}
      value={value}
    >
      <ComboboxChips>
        {value.map((tag) => (
          <ComboboxChip key={tag}>{tag}</ComboboxChip>
        ))}
        <ComboboxChipsInput
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag…"
          value={inputValue}
        />
      </ComboboxChips>
    </Combobox>
  );
}
