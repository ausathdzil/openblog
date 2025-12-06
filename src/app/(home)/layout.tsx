import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserButton } from '@/components/user-button';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 bg-background p-4 pt-safe-top">
      <nav className="mx-auto flex max-w-6xl items-center">
        <Button asChild size="sm" variant="ghost">
          <Link href="/">Peruere</Link>
        </Button>
        <Suspense
          fallback={<Skeleton className="ml-auto h-8 w-[200px] rounded-full" />}
        >
          <UserButton className="ml-auto" />
        </Suspense>
      </nav>
    </header>
  );
}
