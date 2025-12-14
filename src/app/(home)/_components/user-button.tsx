import type { VariantProps } from 'class-variance-authority';
import type { Route } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

import { Button, type buttonVariants } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

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
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {session?.user ? (
        <Button
          nativeButton={false}
          render={<Link href="/profile" />}
          size="pill-sm"
          variant="secondary"
        >
          Profile
        </Button>
      ) : (
        navItems.map((item) => (
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
