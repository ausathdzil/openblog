import Image from 'next/image';
import Link from 'next/link';

import openblog from '@/../public/openblog.png';
import { Header } from '@/components/header';
import { HeaderActions } from '@/components/header-actions';
import { Button } from '@/components/ui/button';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />
      {children}
    </div>
  );
}

function HomeHeader() {
  return (
    <Header>
      <Header.Nav>
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
      </Header.Nav>
      <Header.Actions>
        <HeaderActions />
      </Header.Actions>
    </Header>
  );
}
