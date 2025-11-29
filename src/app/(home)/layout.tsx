import type { VariantProps } from 'class-variance-authority';
import type { Route } from 'next';
import Link from 'next/link';

import { Button, type buttonVariants } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}

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

async function Header() {
  const session = await authClient.getSession();

  return (
    <header className="border-b p-4">
      <nav className="mx-auto flex max-w-6xl items-center">
        <Button asChild size="sm" variant="ghost">
          <Link href="/">Peruere</Link>
        </Button>
        <div className="ml-auto space-x-2">
          {session.data?.user.email}
          {navItems.map((item) => (
            <Button
              asChild
              key={item.href}
              size="pill-sm"
              variant={item.variant}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </nav>
    </header>
  );
}
