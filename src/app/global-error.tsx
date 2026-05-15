'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';

import { Button } from '@/components/ui/button';
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

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          'font-sans dark:antialiased'
        )}
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
                <EmptyDescription>
                  Message:{' '}
                  {process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Something went wrong. Please try again.'}
                </EmptyDescription>
                {error.digest ? (
                  <EmptyTitle>Digest: {error.digest}</EmptyTitle>
                ) : null}
                <Button onClick={reset}>Try again</Button>
              </EmptyContent>
            </Empty>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
