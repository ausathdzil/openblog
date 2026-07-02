import Link from 'next/link';

import { Header } from '@/components/header';
import { HeaderActions } from '@/components/header-actions';
import { OpenBlogButton } from '@/components/openblog-button';
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
        <OpenBlogButton />
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
