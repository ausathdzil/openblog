import type { VariantProps } from 'class-variance-authority';
import type { Route } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button, type buttonVariants } from './ui/button';

type NavItem<T extends string = string> = {
  href: T;
  label: string;
} & VariantProps<typeof buttonVariants>;

const navItems: NavItem<Route>[] = [
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
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {session?.user ? (
        <Button asChild size="pill-sm" variant="secondary">
          <Link href="/profile">Profile</Link>
        </Button>
      ) : (
        navItems.map((item) => (
          <Button asChild key={item.href} size="pill-sm" variant={item.variant}>
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))
      )}
    </div>
  );
}
