"use client"

import * as React from "react"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
} from "@/components/ui/combobox"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function TagInput({ value = [], onChange }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag])
      }
      setInputValue("")
    }
  }

  return (
    <Combobox 
      multiple
      value={value} 
      onValueChange={(val) => {
        onChange(val as string[])
      }}
      open={false} 
      onOpenChange={() => {}}
    >
      <ComboboxChips>
        {value.map(tag => (
          <ComboboxChip 
            key={tag} 
          >
            {tag}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag..."
        />
      </ComboboxChips>
    </Combobox>
  )
}
