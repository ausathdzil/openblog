'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [showTitle, setShowTitle] = useState(false);
  const { back } = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      back();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const threshold = 80; // px
      setShowTitle(y > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
            'absolute left-1/2 line-clamp-1 -translate-x-1/2 transition-opacity',
            showTitle ? 'opacity-100' : 'opacity-0'
          )}
        >
          {title}
        </Large>
        {children}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center p-4 sm:hidden">
        <button
          aria-label="Go back"
          className="size-11 sm:hidden"
          onClick={handleBack}
          type="button"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            onClick={handleBack}
            strokeWidth={2}
          />
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
    </header>
  );
}
