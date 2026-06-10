import Image from 'next/image';
import Link from 'next/link';

import openblog from '@/../public/openblog.png';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex min-h-svh flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center gap-2">
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
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
