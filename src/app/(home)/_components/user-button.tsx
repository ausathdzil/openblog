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

import { ModeToggle } from '@/components/mode-toggle';
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
import { UserModeToggle } from './user-mode-toggle';

interface UserButtonProps extends React.ComponentProps<'div'> {
  session?: typeof auth.$Infer.Session | null;
}

export async function UserButton({
  className,
  session,
  ...props
}: UserButtonProps) {
  let resolvedSession = session;
  if (session === undefined) {
    resolvedSession = await auth.api.getSession({
      headers: await headers(),
    });
  }
  const hasUser = Boolean(resolvedSession?.user);

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {hasUser ? <CreateArticleButton /> : null}
      {resolvedSession?.user ? (
        <UserDropdown user={resolvedSession.user} />
      ) : (
        <>
          <Button
            nativeButton={false}
            render={<Link href="/sign-in" />}
            size="pill-sm"
            variant="default"
          >
            Get Started
          </Button>
          <ModeToggle />
        </>
      )}
    </div>
  );
}

interface NavItem<T extends string = string>
  extends VariantProps<typeof buttonVariants> {
  href: T;
  icon?: React.ReactNode;
  label: string;
}

const dropdownItems: NavItem<Route>[] = [
  {
    href: '/',
    label: 'Home',
    icon: <HugeiconsIcon className="ml-auto" icon={HomeIcon} strokeWidth={2} />,
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: (
      <HugeiconsIcon className="ml-auto" icon={SearchIcon} strokeWidth={2} />
    ),
  },
];

type User = (typeof auth.$Infer.Session)['user'];

function UserDropdown({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu" title="Menu">
        <Avatar>
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar>
                <AvatarImage alt={user.name} src={user.image ?? ''} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
            Profile
            <HugeiconsIcon
              className="ml-auto"
              icon={UserCircleIcon}
              strokeWidth={2}
            />
          </DropdownMenuItem>
          {dropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={item.href} />}
            >
              {item.label}
              {item.icon}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <UserModeToggle />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <SignOutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
