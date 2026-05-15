'use client';

import { useEffect, useRef } from 'react';

import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface ResizableTextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  errors: Array<{ message?: string } | undefined>;
  isInvalid: boolean;
  onChange: (value: string) => void;
  value: string;
}

export function ResizableTextarea({
  errors,
  isInvalid,
  onChange,
  value,
  className,
  ...props
}: ResizableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }

    el.value = value;
    resize(el);
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.currentTarget.value);
    resize(e.currentTarget);
  };

  return (
    <div className="mb-[0.888889em]">
      <textarea
        className={cn(
          'w-full resize-none overflow-hidden focus:outline-none',
          className
        )}
        onChange={handleValueChange}
        ref={textareaRef}
        rows={1}
        value={value}
        {...props}
      />
      {isInvalid && <FieldError errors={errors} />}
    </div>
  );
}

function resize(el: HTMLTextAreaElement) {
  el.style.height = '0px';
  el.style.height = `${el.scrollHeight}px`;
}
