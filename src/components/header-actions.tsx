import {
  HomeIcon,
  SearchIcon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { Route } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { CreateArticleButton } from './create-article-button';
import { MobileNavSheet } from './mobile-nav-sheet';
import { MobileSignOutButton } from './mobile-sign-out-button';
import { Button } from './ui/button';
import { UserButton } from './user-button';

interface MobileNavLink {
  href: Route;
  icon: IconSvgElement;
  label: string;
  variant?: 'default' | 'outline';
}

const userLinks: MobileNavLink[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/explore', label: 'Explore', icon: SearchIcon },
  { href: '/profile', label: 'Profile', icon: UserCircleIcon },
];

const guestLinks: MobileNavLink[] = [
  { href: '/', label: 'Home', icon: HomeIcon, variant: 'outline' },
  { href: '/explore', label: 'Explore', icon: SearchIcon, variant: 'outline' },
  {
    href: '/sign-in',
    label: 'Get Started',
    icon: UserCircleIcon,
    variant: 'default',
  },
];

export function HeaderActions() {
  return (
    <Suspense fallback={<HeaderActionsFallback />}>
      <HeaderActionsContent />
    </Suspense>
  );
}

async function HeaderActionsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <div className="hidden items-center gap-4 sm:flex">
        {session?.user ? <CreateArticleButton /> : null}
        <UserButton className="" session={session} />
      </div>

      <div className="-mr-3 flex items-center gap-2 sm:hidden">
        {session?.user ? (
          <CreateArticleButton className="h-11" />
        ) : (
          <Button className="h-11" size="pill-sm">
            Get Started
          </Button>
        )}
        <MobileNavSheet
          footerAction={
            session?.user ? (
              <MobileSignOutButton className="h-11 flex-1" />
            ) : null
          }
          links={session?.user ? userLinks : guestLinks}
        />
      </div>
    </>
  );
}

function HeaderActionsFallback() {
  return <Skeleton className="h-8 w-31 rounded-full" />;
}
