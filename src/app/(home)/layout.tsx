import Image from 'next/image';
import Link from 'next/link';

import openblog from '@/../public/openblog.png';
import { HeaderActions } from '@/components/header-actions';
import { Button } from '@/components/ui/button';

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
    <header className="sticky top-0 z-10 bg-background pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-4 sm:gap-4 sm:p-4">
        <nav className="flex flex-1 items-center gap-2 sm:gap-4">
          <Button
            className="gap-2"
            nativeButton={false}
            render={<Link href="/" />}
            size="sm"
            variant="ghost"
          >
            <Image
              alt="OpenBlog"
              className="dark:invert"
              height={12}
              src={openblog}
              width={12}
            />
            OpenBlog
          </Button>
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/explore" />}
            size="sm"
            variant="ghost"
          >
            Explore
          </Button>
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}
