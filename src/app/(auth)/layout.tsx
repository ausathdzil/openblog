import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Peruere</Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block" />
    </main>
  );
}
