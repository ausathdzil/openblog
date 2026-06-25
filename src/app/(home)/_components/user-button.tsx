import { headers } from 'next/headers';
import Link from 'next/link';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { CreateArticleButton } from './create-article-button';
import { UserDropdown } from './user-dropdown';

interface UserButtonProps extends React.ComponentProps<'div'> {
  session?: typeof auth.$Infer.Session | null;
}

export async function UserButton({
  className,
  session,
  ...props
}: UserButtonProps) {
  let resolvedSession = session;
  if (session === undefined) {
    resolvedSession = await auth.api.getSession({
      headers: await headers(),
    });
  }
  const hasUser = Boolean(resolvedSession?.user);

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {hasUser ? <CreateArticleButton /> : null}
      {resolvedSession?.user ? (
        <UserDropdown user={resolvedSession.user} />
      ) : (
        <>
          <Button
            nativeButton={false}
            render={<Link href="/sign-in" />}
            size="pill-sm"
            variant="default"
          >
            Get Started
          </Button>
          <ModeToggle />
        </>
      )}
    </div>
  );
}
