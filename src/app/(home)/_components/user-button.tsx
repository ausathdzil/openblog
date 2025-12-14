import {
  HomeIcon,
  SearchIcon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { VariantProps } from 'class-variance-authority';
import type { Route } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, type buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { CreateArticleButton } from './create-article-button';
import { SignOutButton } from './sign-out-button';

type NavItem<T extends string = string> = {
  href: T;
  label: string;
  icon?: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

const authNav: NavItem<Route>[] = [
  {
    href: '/sign-in',
    label: 'Sign In',
    variant: 'secondary',
  },
  {
    href: '/sign-up',
    label: 'Get Started',
    variant: 'default',
  },
];

export async function UserButton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {session && <CreateArticleButton />}
      {session?.user ? (
        <UserDropdown user={session.user} />
      ) : (
        authNav.map((item) => (
          <Button
            key={item.href}
            nativeButton={false}
            render={<Link href={item.href} />}
            size="pill-sm"
            variant={item.variant}
          >
            {item.label}
          </Button>
        ))
      )}
    </div>
  );
}

const dropdownItems: NavItem<Route>[] = [
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
];

type User = (typeof auth.$Infer.Session)['user'];

function UserDropdown({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button aria-label="Menu" title="Menu" type="button" />}
      >
        <Avatar>
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="rounded-lg">
                <AvatarImage alt={user.name} src={user.image ?? ''} />
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
            Profile
          </DropdownMenuItem>
          {dropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={item.href} />}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <SignOutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
