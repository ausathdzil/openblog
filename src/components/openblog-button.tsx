import Image from 'next/image';
import Link from 'next/link';

import openblog from '@/../public/openblog.png';
import { Button } from '@/components/ui/button';

export function OpenBlogButton() {
  return (
    <Button
      className="-ml-3"
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
  );
}
