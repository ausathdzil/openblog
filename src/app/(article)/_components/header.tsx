'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Large } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderProps = {
  title?: string;
  onBackClick?: () => void;
} & React.ComponentProps<'header'>;

export function Header({
  title,
  onBackClick,
  className,
  children,
  ...props
}: HeaderProps) {
  const [showTitle, setShowTitle] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
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
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 p-4">
        <Button
          className="h-11 px-3 sm:h-8 sm:px-2.5"
          onClick={handleBack}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          <span className="hidden sm:inline">Back</span>
          <span className="sr-only sm:hidden">Back</span>
        </Button>
        <Large
          aria-hidden={!showTitle}
          className={cn(
            'absolute left-1/2 hidden -translate-x-1/2 transition-opacity sm:block',
            showTitle ? 'opacity-100' : 'opacity-0'
          )}
        >
          {title}
        </Large>
        {children}
      </div>
    </header>
  );
}
