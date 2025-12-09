'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import type { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

type User = (typeof authClient.$Infer.Session)['user'];

type UserNavProps = {
  user: User | undefined;
  username: string;
} & React.ComponentProps<'div'>;

export function UserNav({ user, username, className, ...props }: UserNavProps) {
  const pathname = usePathname();

  const isArticlesPage = pathname === `/u/${username}`;
  const isDraftsPage = pathname === `/u/${username}/articles/drafts`;

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Button
        asChild
        size="pill-sm"
        variant={isArticlesPage ? 'secondary' : 'ghost'}
      >
        <Link href={`/u/${username}`}>Articles</Link>
      </Button>
      {user?.username === username && (
        <Button
          asChild
          size="pill-sm"
          variant={isDraftsPage ? 'secondary' : 'ghost'}
        >
          <Link href={`/u/${username}/articles/drafts`}>Drafts</Link>
        </Button>
      )}
    </div>
  );
}
