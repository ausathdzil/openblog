import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { cn } from '@/lib/utils';
import './globals.css';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Peruere',
  description: 'A new world to share your thoughts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, 'font-sans dark:antialiased')}>
        {children}
      </body>
    </html>
  );
}
