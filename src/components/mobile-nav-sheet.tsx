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

interface MobileNavSheetProps {
  footerAction?: React.ReactNode;
  links: MobileNavLink[];
}

export interface MobileNavLink {
  href: Route;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'outline';
}

export const userLinks: MobileNavLink[] = [
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

export const guestLinks: MobileNavLink[] = [
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
    label: 'Get Started',
    icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
    variant: 'default',
  },
];

export function MobileNavSheet({ links, footerAction }: MobileNavSheetProps) {
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
        <SheetHeader className="border-b">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Browse pages and account actions.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
          {links.map((link) => (
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
          <ModeToggle align="start" className="size-11" />
          {footerAction}
        </div>
      </SheetContent>
    </Sheet>
  );
}
