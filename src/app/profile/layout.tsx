import { Home01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { CreateArticleButton } from './_components/create-article-button';

export default function ProfileLayout({ children }: LayoutProps<'/profile'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 border-b bg-background pt-safe-top">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 p-4">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
          Home
        </Button>
        <CreateArticleButton className="ml-auto" />
        <ModeToggle />
      </div>
    </header>
  );
}
