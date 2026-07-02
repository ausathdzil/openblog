import type * as React from 'react';

import { cn } from '@/lib/utils';

export function Header({
  className,
  children,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn('sticky top-0 z-10 bg-background pt-safe-top', className)}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-6 py-4 sm:gap-4 sm:p-4">
        {children}
      </div>
    </header>
  );
}

Header.Nav = function HeaderNav({
  className,
  children,
  ...props
}: React.ComponentProps<'nav'>) {
  return (
    <nav
      className={cn('flex flex-1 items-center gap-2 sm:gap-4', className)}
      {...props}
    >
      {children}
    </nav>
  );
};

Header.Center = function HeaderCenter({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('absolute left-1/2 -translate-x-1/2', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Header.Actions = function HeaderActions({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
};
