'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import localFont from 'next/font/local';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, 'font-sans dark:antialiased')}>
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
