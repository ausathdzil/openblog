'use client';

import type { VariantProps } from 'class-variance-authority';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signOut, useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Text } from './typography';
import { Button, type buttonVariants } from './ui/button';
import { Skeleton } from './ui/skeleton';

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

export function UserButton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [loading, setLoading] = useState(false);

  const { data, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className={className} {...props}>
        <Skeleton className="h-8 w-[200px] rounded-full" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          router.push('/sign-in');
        },
      },
    });
  };

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {data?.user ? (
        <>
          <Text>Hey 👋, {data.user.name}!</Text>
          <Button
            disabled={loading}
            onClick={handleSignOut}
            size="pill-sm"
            type="button"
            variant="destructive"
          >
            Sign Out
          </Button>
        </>
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
