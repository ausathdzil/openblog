'use client';

import {
  HomeIcon,
  Menu01Icon,
  SearchIcon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { MobileSignOutButton } from './mobile-sign-out-button';

interface MobileNavSheetProps {
  isSignedIn: boolean;
}

interface MobileNavLink {
  href: Route;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'outline';
}

const userLinks: MobileNavLink[] = [
  {
    href: '/',
    label: 'Home',
    icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
  },
];

const guestLinks: MobileNavLink[] = [
  {
    href: '/',
    label: 'Home',
    icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
    variant: 'outline',
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />,
    variant: 'outline',
  },
  {
    href: '/sign-in',
    label: 'Sign In',
    icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
    variant: 'outline',
  },
  {
    href: '/sign-up',
    label: 'Get Started',
    icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
    variant: 'default',
  },
];

export function MobileNavSheet({ isSignedIn }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        aria-label="Open navigation menu"
        render={<Button className="size-11" size="icon" variant="ghost" />}
        title="Open navigation menu"
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
      </SheetTrigger>
      <SheetContent
        className="w-[min(88vw,22rem)] max-w-none gap-0 p-0 pt-safe-top"
        side="right"
      >
        <SheetHeader className="border-b p-4 pr-14">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse pages and account actions.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
          {(isSignedIn ? userLinks : guestLinks).map((link) => (
            <Button
              className={cn('h-11 justify-start')}
              key={link.href}
              nativeButton={false}
              onClick={() => setOpen(false)}
              render={<Link href={link.href} />}
              variant={link.variant ?? 'outline'}
            >
              {link.icon}
              {link.label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t p-4">
          <ModeToggle className="size-11" />
          {isSignedIn ? (
            <MobileSignOutButton
              className="h-11 flex-1"
              onSignedOut={() => setOpen(false)}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
