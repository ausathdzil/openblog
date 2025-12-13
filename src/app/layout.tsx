import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

const calSans = localFont({
  src: './fonts/CalSans-Semibold.woff2',
  variable: '--font-cal-sans',
  display: 'swap',
});

const commitMono = localFont({
  src: './fonts/CommitMono VariableFont.woff2',
  variable: '--font-commit-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Peruere',
    template: '%s | Peruere',
  },
  description: 'A new world to share your thoughts.',
  appleWebApp: {
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          calSans.variable,
          commitMono.variable,
          'font-sans dark:antialiased',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <NuqsAdapter>
            {children}
            <Toaster richColors />
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
