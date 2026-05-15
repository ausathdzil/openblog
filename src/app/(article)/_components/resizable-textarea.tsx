'use client';

import {
  type ChangeEvent,
  type ComponentProps,
  useEffect,
  useRef,
} from 'react';

import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';

type ResizableTextareaProps = {
  errors: Array<{ message?: string } | undefined>;
  isInvalid: boolean;
  onChange: (value: string) => void;
  value: string;
} & Omit<ComponentProps<'textarea'>, 'onChange' | 'value'>;

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
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.currentTarget.value);
    const el = e.currentTarget;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="mb-[0.888889em]">
      <textarea
        className={cn(
          'w-full resize-none overflow-hidden focus:outline-none',
          className
        )}
        onChange={handleResize}
        ref={textareaRef}
        rows={1}
        value={value}
        {...props}
      />
      {isInvalid && <FieldError errors={errors} />}
    </div>
  );
}
