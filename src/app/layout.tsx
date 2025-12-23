import type { Metadata, Viewport } from 'next';
import { Public_Sans, Roboto_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Peruere',
    template: '%s | Peruere',
  },
  description: 'A new world to share your thoughts.',
  appleWebApp: {
    capable: true,
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
          publicSans.variable,
          robotoMono.variable,
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
