'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { Large } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps extends React.ComponentProps<'header'> {
  onBackClick?: () => void;
  title?: string;
}

export function Header({
  title,
  onBackClick,
  className,
  children,
  ...props
}: HeaderProps) {
  const showTitle = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { back } = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      back();
    }
  };

  return (
    <header
      className={cn('sticky top-0 z-10 bg-background pt-safe-top', className)}
      {...props}
    >
      <div className="relative mx-auto hidden w-full max-w-6xl items-center justify-between gap-4 p-4 sm:flex">
        <Button onClick={handleBack} size="sm" variant="ghost">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back
        </Button>
        <Large
          aria-hidden={!showTitle}
          className={cn(
            'absolute left-1/2 line-clamp-1 -translate-x-1/2',
            showTitle ? 'opacity-100' : 'opacity-0'
          )}
        >
          {title}
        </Large>
        {children}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
          <button
            aria-label="Go back"
            className="-ml-4 flex size-11 shrink-0 items-center justify-center"
            onClick={handleBack}
            type="button"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </button>
          <Large
            className={cn(
              'line-clamp-1',
              showTitle ? 'opacity-100' : 'opacity-0'
            )}
          >
            {title}
          </Large>
        </div>
        {children}
      </div>
    </header>
  );
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {
      // no-op
    };
  }
  window.addEventListener('scroll', callback, { passive: true });
  return () => {
    window.removeEventListener('scroll', callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }
  const y =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  return y > 80;
}

function getServerSnapshot() {
  return false;
}
