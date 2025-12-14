'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UserNavProps = {
  username: string;
} & React.ComponentProps<'div'>;

export function UserNav({ username, className, ...props }: UserNavProps) {
  const pathname = usePathname();
  const isArticlesPage = pathname === `/u/${username}`;

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Button
        nativeButton={false}
        render={<Link href={`/u/${username}`} />}
        size="pill-sm"
        variant={isArticlesPage ? 'secondary' : 'ghost'}
      >
        Articles
      </Button>
    </div>
  );
}
