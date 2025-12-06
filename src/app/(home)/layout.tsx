import Link from 'next/link';
import { Suspense } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
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
    <header className="sticky top-0 bg-background pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <nav className="flex flex-1 items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Peruere</Link>
          </Button>
          <Suspense
            fallback={
              <Skeleton className="ml-auto h-8 w-[200px] rounded-full" />
            }
          >
            <UserButton className="ml-auto" />
          </Suspense>
        </nav>
        <ModeToggle />
      </div>
    </header>
  );
}
