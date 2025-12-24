'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Libre_Franklin } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import './globals.css';

const libreFranklin = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-libre-franklin',
  display: 'swap',
});

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body
        className={cn(libreFranklin.variable, 'font-sans dark:antialiased')}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <main className="grid min-h-screen place-items-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>Message: {error.message}</EmptyDescription>
                <EmptyTitle>Digest: {error.digest}</EmptyTitle>
              </EmptyContent>
            </Empty>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
